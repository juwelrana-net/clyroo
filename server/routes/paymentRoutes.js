// server/routes/paymentRoutes.js

const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/Order");
const { deliverProduct } = require("../utils/delivery");

const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

// --- NOWPAYMENTS ROUTE 1: Create Invoice ---
router.post("/nowpayments/create", async (req, res) => {
  const { orderId, coinApiCode } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== "Pending") {
      return res
        .status(404)
        .json({ msg: "Valid order not found or already processed" });
    }

    if (!coinApiCode) {
      return res.status(400).json({ msg: "Coin API code is required" });
    }

    // --- STEP 1: MINIMUM AMOUNT CHECK (Future Proofing) ---
    // Hum check karenge ki kya $5 USD is coin ke liye kaafi hai?
    try {
      const minAmountRes = await axios.get(
        `${NOWPAYMENTS_API_URL}/min-amount?currency_from=usd&currency_to=${coinApiCode}`,
        { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
      );

      const minAmount = minAmountRes.data.min_amount;

      // Agar order price minimum se kam hai
      if (order.priceAtPurchase < minAmount) {
        return res.status(400).json({
          msg: `Order amount ($${
            order.priceAtPurchase
          }) is too small for ${coinApiCode.toUpperCase()}. Minimum required is $${minAmount}. Please add this wallet to NOWPayments Whitelist or choose a cheaper coin.`,
        });
      }
    } catch (minErr) {
      console.error(
        "Minimum amount check failed, trying anyway:",
        minErr.message
      );
    }

    // --- STEP 2: CREATE INVOICE ---
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: order.priceAtPurchase, // Amount (e.g., 5.00)
        price_currency: "usd", // [FIX] Base currency fixed to USD
        pay_currency: coinApiCode, // User is coin main pay karega
        order_id: order._id.toString(),
        ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,

        // [FIX] Aapki requirement: "5 hai to 5 hi aana chahiye"
        // False karne se fees aapke payout se kategi, user ko exact amount dikhega.
        is_fee_paid_by_user: false,
      },
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );

    // Database update
    order.gatewayPaymentId = response.data.payment_id;
    order.paymentGateway = "NowPayments";
    order.status = "Awaiting-Payment";
    await order.save();

    res.json(response.data);
  } catch (err) {
    console.error("--- NOWPAYMENTS CREATE ERROR ---");
    // Detailed error logging for debugging
    const errorMsg = err.response?.data?.message || err.message;
    console.error(errorMsg);

    // Specific user-friendly error
    if (errorMsg.includes("amount") && errorMsg.includes("small")) {
      return res.status(400).json({
        msg: `Amount is too small. Please ensure the ${coinApiCode} wallet is added and Whitelisted in your NOWPayments settings.`,
      });
    }

    res.status(500).json({
      msg: "Failed to create payment invoice.",
      error: errorMsg,
    });
  }
});

// --- NOWPAYMENTS ROUTE 2: Webhook (Same logic, slightly cleaned) ---
router.post("/nowpayments/webhook", async (req, res) => {
  try {
    const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
    hmac.update(req.rawBody);
    const signature = hmac.digest("hex");
    if (req.headers["x-nowpayments-sig"] !== signature) {
      console.error("!!! INVALID WEBHOOK SIGNATURE !!!");
      return res.status(401).send("Invalid Signature");
    }
  } catch (e) {
    console.error("!!! SIGNATURE VERIFICATION FAILED !!!", e.message);
    return res.status(500).send("Signature verification failed");
  }

  const { payment_status, order_id } = req.body;
  console.log(`Webhook received: Order ${order_id} -> ${payment_status}`);

  try {
    const order = await Order.findOne({ _id: order_id }).populate(
      "product",
      "name"
    );

    if (!order) {
      return res.status(200).send("Order not found.");
    }

    // Idempotency check (Agar pehle hi process ho chuka hai)
    if (
      [
        "Completed",
        "Failed",
        "Partially_paid",
        "Cancelled",
        "Expired",
      ].includes(order.status)
    ) {
      return res.status(200).send("Order already processed.");
    }

    // Payment Success
    if (payment_status === "finished" || payment_status === "confirmed") {
      await deliverProduct(order);
      return res.status(200).send("Product delivered.");
    } else {
      // Status update (waiting, confirming, etc.)
      order.status = payment_status;
      await order.save();
      res.status(200).send(`Status updated to ${payment_status}.`);
    }
  } catch (err) {
    console.error("NOWPayments Webhook DB Error:", err);
    res.status(500).send("Server error processing webhook");
  }
});

module.exports = router;
