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

    console.log(
      `[Payment Init] Order: ${orderId} | Price: $${order.priceAtPurchase} | Coin: ${coinApiCode}`
    );

    // --- STEP 1: MINIMUM AMOUNT CHECK ---
    // Hum check karenge ki kya $5 USD is coin ke liye kaafi hai?
    try {
      // Currency FROM 'usd' rakha hai kyunki product price USD mein hai
      const minAmountRes = await axios.get(
        `${NOWPAYMENTS_API_URL}/min-amount?currency_from=usd&currency_to=${coinApiCode}`,
        { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
      );

      const minAmount = minAmountRes.data.min_amount;
      console.log(
        `[Min Check] Required: $${minAmount} | Order: $${order.priceAtPurchase}`
      );

      // Agar order price minimum se kam hai
      // Note: Thoda buffer (0.1) rakhte hain rounding errors ke liye
      if (order.priceAtPurchase < minAmount) {
        return res.status(400).json({
          msg: `Order amount ($${
            order.priceAtPurchase
          }) is too small for ${coinApiCode.toUpperCase()}. Minimum required by network is $${minAmount}. Please add this wallet to NOWPayments settings or choose a cheaper coin (like TRX or BSC).`,
        });
      }
    } catch (minErr) {
      console.error("Minimum amount check warning:", minErr.message);
      // Agar API fail ho jaye, to hum rokhenge nahi, Invoice create karne ka try karenge.
    }

    // --- STEP 2: CREATE INVOICE ---
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: order.priceAtPurchase, // e.g., 5.00
        price_currency: "usd", // Hamesha 'usd' rakhein taaki value fix rahe
        pay_currency: coinApiCode, // User is coin mein pay karega
        order_id: order._id.toString(),
        ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,

        // Aapne kaha "5 hai to 5 hi aana chahiye", isliye fee user se NAHI lenge.
        // Fees aapke end se kategi.
        is_fee_paid_by_user: false,
      },
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );

    // Database update
    order.gatewayPaymentId = response.data.payment_id;
    order.paymentGateway = "NowPayments";
    order.status = "Awaiting-Payment";
    await order.save();

    console.log(`[Invoice Created] ID: ${response.data.payment_id}`);
    res.json(response.data);
  } catch (err) {
    console.error("--- NOWPAYMENTS CREATE ERROR ---");
    // Agar NOWPayments specific error bhejta hai
    const errorData = err.response ? err.response.data : {};
    const errorMessage = errorData.message || err.message;
    console.error("Error Detail:", errorMessage);

    // Specific "Too Small" error handling
    if (errorMessage && errorMessage.includes("amount is too small")) {
      return res.status(400).json({
        msg: `Order amount is too small for this coin. This usually happens if you haven't added the ${coinApiCode.toUpperCase()} wallet address in NOWPayments settings (causing a swap fee).`,
      });
    }

    res.status(500).json({
      msg: "Failed to create payment invoice.",
      error: errorMessage,
    });
  }
});

// --- NOWPAYMENTS ROUTE 2: Webhook (Standard Logic) ---
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
  console.log(`Webhook: Order ${order_id} -> ${payment_status}`);

  try {
    const order = await Order.findOne({ _id: order_id }).populate(
      "product",
      "name"
    );

    if (!order) return res.status(200).send("Order not found.");

    // Processed orders ko skip karein
    if (
      [
        "Completed",
        "Failed",
        "Partially_paid",
        "Cancelled",
        "Expired",
      ].includes(order.status)
    ) {
      return res.status(200).send("Already processed.");
    }

    if (payment_status === "finished" || payment_status === "confirmed") {
      await deliverProduct(order);
      return res.status(200).send("Product delivered.");
    } else {
      order.status = payment_status;
      await order.save();
      res.status(200).send(`Status updated: ${payment_status}`);
    }
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
