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

    // --- STEP 1: MINIMUM AMOUNT CHECK ---
    // Pehle check karte hain ki $5 USD us coin ke liye valid hai ya nahi
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
          }) is too small for ${coinApiCode.toUpperCase()}. Minimum required is $${minAmount}. Please select a different coin (like USDT-BSC or MATIC).`,
        });
      }
    } catch (minErr) {
      console.error("Minimum amount check failed:", minErr.message);
      // Agar minimum check fail ho jaye (API issue), tab bhi hum aage badhne ka try karenge
      // par log kar denge.
    }

    // --- STEP 2: CREATE INVOICE ---
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: order.priceAtPurchase, // e.g., 5.00
        price_currency: "usd", // [FIX] Hamesha 'usd' rahega kyunki aapka DB price USD main hai
        pay_currency: coinApiCode, // Customer is coin main pay karega (e.g., usdtbsc)
        order_id: order._id.toString(),
        ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,

        // [FIX] Exact Price Issue:
        // Agar aap 'true' karte hain, to customer pay karega: $5 + Network Fee. (Invoice > 5 dikhega)
        // Agar aap 'false' karte hain, to customer pay karega: Exactly value of $5. (Network fee aapke profit se kategi)
        // Aapki requirement "5 hai to 5 hi aana chahiye" ke liye isse FALSE rakhein.
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
    // Detailed error logging
    if (err.response) {
      console.error("Data:", err.response.data);
      console.error("Status:", err.response.status);
    } else {
      console.error("Message:", err.message);
    }

    // Agar error "amountFrom is too small" hai, to user friendly message dein
    const errorMsg = err.response?.data?.message || err.message;
    if (errorMsg.includes("too small")) {
      return res.status(400).json({
        msg: `The amount is too small for ${coinApiCode.toUpperCase()}. Please choose a cheaper network (like USDT-BEP20 or Polygon).`,
      });
    }

    res.status(500).json({
      msg: "Failed to create payment invoice.",
      error: errorMsg,
    });
  }
});

// --- NOWPAYMENTS ROUTE 2: Webhook (Same as before, no changes needed logic-wise) ---
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
  console.log(
    `Webhook received for Order: ${order_id} | Status: ${payment_status}`
  );

  try {
    const order = await Order.findOne({ _id: order_id }).populate(
      "product",
      "name"
    );

    if (!order) {
      return res.status(200).send("Order not found.");
    }

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

    // Payment Logic
    if (payment_status === "finished" || payment_status === "confirmed") {
      await deliverProduct(order);
      return res.status(200).send("Product delivered.");
    } else {
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
