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
    if (!orderId || !coinApiCode) {
      return res
        .status(400)
        .json({ msg: "Order ID and coin API code are required" });
    }

    const order = await Order.findById(orderId);
    if (!order || order.status !== "Pending") {
      return res.status(404).json({ msg: "Valid order not found" });
    }

    // Price sanity check
    const rawPrice = Number(order.priceAtPurchase);
    if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
      return res
        .status(400)
        .json({ msg: "Invalid order price. Please contact support." });
    }

    // Strictly 2 decimal places
    const priceAmount = Number(rawPrice.toFixed(2));

    const payload = {
      price_amount: priceAmount,
      // ❗ Yahan ab hum fiat currency bhej rahe hain (USD)
      price_currency: BASE_FIAT_CURRENCY,
      // ❗ Yahan selected crypto coin ka API code
      pay_currency: coinApiCode,
      order_id: order._id.toString(),
      ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,
      is_fee_paid_by_user: true, // Aapka existing behavior preserve
    };

    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      payload,
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );

    order.gatewayPaymentId = response.data.payment_id;
    order.paymentGateway = "NowPayments";
    order.status = "Awaiting-Payment";
    await order.save();

    // Invoice data client ko
    return res.json(response.data);
  } catch (err) {
    console.error("--- NOWPAYMENTS CREATE ERROR ---");
    console.error(err.response ? err.response.data : err.message);

    return res.status(500).json({
      msg: "Failed to create NOWPayments invoice.",
      error: err.response ? err.response.data : err.message,
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
