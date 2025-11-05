// server/routes/paymentRoutes.js

const express = require("express");
const router = express.Router();
const { Spot } = require("@binance/connector");
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/Order");
const { deliverProduct } = require("../utils/delivery");

const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_SECRET_KEY;
const client = new Spot(apiKey, apiSecret);
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

// --- BINANCE ROUTE 1: Create Invoice ---
router.post("/binance/create", async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== "Pending") {
      return res.status(404).json({ msg: "Valid order not found" });
    }
    const response = await client.createPayOrder({
      /* ... binance config ... */
      merchantTradeNo: order._id.toString(),
      orderAmount: order.priceAtPurchase.toFixed(2),
      currency: "USDT",
      goods: {
        goodsType: "02",
        goodsCategory: "0000",
        referenceGoodsId: order.product.toString(),
        goodsName: "Digital Product Purchase",
      },
      returnUrl: `${process.env.APP_BASE_URL}/order/success/${order._id}`,
      cancelUrl: `${process.env.APP_BASE_URL}/order/cancelled/${order._id}`,
      webhookUrl: `${process.env.APP_BASE_URL}/api/payment/binance/webhook`,
    });
    order.gatewayPaymentId = response.data.prepayId;
    order.paymentGateway = "BinancePay";
    order.status = "Awaiting-Payment";
    await order.save();
    res.json(response.data);
  } catch (err) {
    console.error("--- BINANCE PAY CREATE ERROR ---");
    console.error(err); // Poora error object log karein
    res.status(500).json({
      msg: "Failed to create Binance invoice.",
      error: err.message,
    });
  }
});

// --- BINANCE ROUTE 2: Webhook ---
router.post("/binance/webhook", async (req, res) => {
  // ... (waisa hi hai, bas ab 'deliverProduct' ko call karega) ...
  const binanceData = req.body;
  try {
    if (binanceData.status === "PAID") {
      const prepayId = binanceData.prepayId;
      const order = await Order.findOne({
        gatewayPaymentId: prepayId,
      }).populate("product", "name");
      if (order && order.status === "Awaiting-Payment") {
        await deliverProduct(order); // <-- Naye function ko call karein
        res.status(200).json({ returnCode: "SUCCESS" });
      } else {
        res.status(200).json({ returnCode: "SUCCESS" });
      }
    }
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).json({ returnCode: "FAIL" });
  }
});

// --- NOWPAYMENTS ROUTE 1: Create Invoice ---
router.post("/nowpayments/create", async (req, res) => {
  // ... (Code waisa hi hai, koi change nahi) ...
  const { orderId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== "Pending") {
      return res.status(404).json({ msg: "Valid order not found" });
    }
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: order.priceAtPurchase.toFixed(2),
        price_currency: "usd",
        pay_currency: "usdterc20",
        order_id: order._id.toString(),
        ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,
      },
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );
    order.gatewayPaymentId = response.data.payment_id;
    order.paymentGateway = "NowPayments";
    order.status = "Awaiting-Payment";
    await order.save();
    res.json(response.data);
  } catch (err) {
    console.error("--- NOWPAYMENTS CREATE ERROR ---");
    console.error(err); // Poora error object log karein
    res.status(500).json({
      msg: "Failed to create NOWPayments invoice.",
      error: err.message,
    });
  }
});

// --- NOWPAYMENTS ROUTE 2: Webhook ---
router.post("/nowpayments/webhook", async (req, res) => {
  // ... (waisa hi hai, bas ab 'deliverProduct' ko call karega) ...
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
        await deliverProduct(order); // <-- Naye function ko call karein
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
