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
// --- YEH ROUTE AB UPDATE HO GAYA HAI ---
router.post("/nowpayments/create", async (req, res) => {
  // Client se ab 'coinApiCode' bhi lein
  const { orderId, coinApiCode } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== "Pending") {
      return res.status(404).json({ msg: "Valid order not found" });
    }

    // Validation: Check karein ki coinApiCode bheja gaya hai
    if (!coinApiCode) {
      return res.status(400).json({ msg: "Coin API code is required" });
    }

    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: order.priceAtPurchase.toFixed(2),
        price_currency: "usd",
        pay_currency: coinApiCode, // <-- Hardcoded "usdterc20" ko 'coinApiCode' se badal diya
        order_id: order._id.toString(),
        ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,
      },
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );

    order.gatewayPaymentId = response.data.payment_id;
    order.paymentGateway = "NowPayments";
    order.status = "Awaiting-Payment";
    await order.save();

    res.json(response.data); // Poora NOWPayments ka response wapas bhejein
  } catch (err) {
    console.error("--- NOWPAYMENTS CREATE ERROR ---");
    console.error(err.response ? err.response.data : err.message); // Behtar error logging
    res.status(500).json({
      msg: "Failed to create NOWPayments invoice.",
      error: err.response ? err.response.data : err.message,
    });
  }
});

// --- NOWPAYMENTS ROUTE 2: Webhook ---
router.post("/nowpayments/webhook", async (req, res) => {
  // ... (Yeh code waisa hi hai, koi change nahi) ...
  try {
    const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
    hmac.update(JSON.stringify(req.body, Object.keys(req.body).sort()));
    const signature = hmac.digest("hex");
    if (req.headers["x-nowpayments-sig"] !== signature) {
      return res.status(401).send("Invalid Signature");
    }
  } catch (e) {
    return res.status(500).send("Signature verification failed");
  }

  const { payment_status, order_id } = req.body;
  try {
    if (payment_status === "finished") {
      const order = await Order.findOne({ _id: order_id }).populate(
        "product",
        "name"
      );
      if (order && order.status === "Awaiting-Payment") {
        await deliverProduct(order);
        res.status(200).send("Webhook received and processed.");
      } else {
        res.status(200).send("Webhook received, but order already processed.");
      }
    } else {
      res.status(200).send(`Webhook received with status: ${payment_status}`);
    }
  } catch (err) {
    console.error("NOWPayments Webhook DB Error:", err);
    res.status(500).send("Server error processing webhook");
  }
});

module.exports = router;
