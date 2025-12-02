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

// --- UTILITY: Error Handler ---
const handlePaymentError = (err, coinApiCode) => {
  // Agar NOWPayments ne response diya hai
  if (err.response && err.response.data) {
    const msg = err.response.data.message || JSON.stringify(err.response.data);
    console.error(`[NOWPayments Error] ${msg}`);

    // Agar Invoice create karte waqt error aaya ki amount chhota hai
    if (
      msg.includes("amount") &&
      (msg.includes("small") || msg.includes("min"))
    ) {
      return {
        status: 400,
        json: {
          msg: `The order amount ($5.00) is too small for ${coinApiCode.toUpperCase()} according to the payment processor. Please try a different coin (like TRX or LTC) or contact support if you believe this is an error.`,
          technical_details: msg,
        },
      };
    }

    // API Key Issue
    if (msg.includes("API key")) {
      return {
        status: 500,
        json: { msg: "Server Error: Payment gateway configuration issue." },
      };
    }
  }

  // Default Error
  return {
    status: 500,
    json: {
      msg: "Failed to initiate payment gateway. Please try again later.",
    },
  };
};

// --- ROUTE 1: Create Invoice (Direct Mode) ---
router.post("/nowpayments/create", async (req, res) => {
  const { orderId, coinApiCode } = req.body;

  try {
    // 1. Order Validation
    const order = await Order.findById(orderId);
    if (!order || order.status !== "Pending") {
      return res
        .status(404)
        .json({ msg: "Order not found or already active." });
    }

    if (!coinApiCode) {
      return res.status(400).json({ msg: "Payment coin is required." });
    }

    console.log(
      `[Payment Request] Order: ${orderId} | Price: $${order.priceAtPurchase} -> Coin: ${coinApiCode}`
    );

    // 2. Direct Payment Creation (NO PRE-CHECK)
    // Humne yahan se 'min-amount' check hata diya hai.
    // Hum seedha invoice create karne ka try karenge.
    // Agar Custody enabled hai, toh ye $5 accept kar lega.
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: order.priceAtPurchase, // e.g. 5.00
        price_currency: "usd", // Base currency USD
        pay_currency: coinApiCode, // Selected Crypto
        order_id: order._id.toString(),
        ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,

        // Aapki requirement: "5 hai to 5 hi aana chahiye"
        // False = Fees aapke account se kategi, user ko exact amount dikhega.
        is_fee_paid_by_user: false,
      },
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );

    // 3. Success - Update DB
    order.gatewayPaymentId = response.data.payment_id;
    order.paymentGateway = "NowPayments";
    order.status = "Awaiting-Payment";
    await order.save();

    console.log(`[Payment Created] ID: ${response.data.payment_id}`);
    res.json(response.data);
  } catch (err) {
    // 4. Handle Errors (Agar Invoice Creation fail hota hai)
    const errorResponse = handlePaymentError(err, coinApiCode);
    return res.status(errorResponse.status).json(errorResponse.json);
  }
});

// --- ROUTE 2: Webhook (Secure & Verified) ---
router.post("/nowpayments/webhook", async (req, res) => {
  try {
    // 1. Signature Verification
    const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
    hmac.update(req.rawBody);
    const signature = hmac.digest("hex");

    if (req.headers["x-nowpayments-sig"] !== signature) {
      console.warn("⚠️ Invalid Webhook Signature received.");
      return res.status(401).send("Invalid Signature");
    }
  } catch (e) {
    console.error("Webhook Signature Error:", e.message);
    return res.status(500).send("Verification failed");
  }

  const { payment_status, order_id } = req.body;
  console.log(`[Webhook] Order: ${order_id} | Status: ${payment_status}`);

  try {
    // 2. Find Order
    const order = await Order.findOne({ _id: order_id }).populate(
      "product",
      "name"
    );

    if (!order) {
      return res.status(200).send("Order not found, stopped retries.");
    }

    // 3. Idempotency Check
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

    // 4. Status Handling
    if (payment_status === "finished" || payment_status === "confirmed") {
      // Payment Done -> Deliver Product
      await deliverProduct(order);
      console.log(`[Success] Order ${order_id} delivered.`);
      return res.status(200).send("Product delivered.");
    } else {
      // Update status only
      order.status = payment_status;
      await order.save();
      return res.status(200).send(`Status updated to ${payment_status}`);
    }
  } catch (err) {
    console.error("Webhook Processing Error:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
