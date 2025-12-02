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
  if (err.response && err.response.data) {
    const msg = err.response.data.message || JSON.stringify(err.response.data);
    console.error(`[NOWPayments Error] ${msg}`);

    if (
      msg.includes("amount") &&
      (msg.includes("small") || msg.includes("min"))
    ) {
      return {
        status: 400,
        json: {
          msg: `The order amount is too small for ${coinApiCode.toUpperCase()}. Please add this wallet to NOWPayments Whitelist or choose a different coin (like TRX/LTC).`,
          technical_details: msg,
        },
      };
    }
    if (msg.includes("API key")) {
      return {
        status: 500,
        json: { msg: "Server Error: Payment gateway configuration issue." },
      };
    }
  }
  return {
    status: 500,
    json: {
      msg: "Failed to initiate payment gateway. Please try again later.",
    },
  };
};

// --- NOWPAYMENTS ROUTE 1: Create Invoice ---
router.post("/nowpayments/create", async (req, res) => {
  const { orderId, coinApiCode } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== "Pending") {
      return res
        .status(404)
        .json({ msg: "Order not found or already active." });
    }

    if (!coinApiCode) {
      return res.status(400).json({ msg: "Payment coin is required." });
    }

    // --- SMART CURRENCY LOGIC (New Fix) ---
    // Agar Stablecoin hai, to hum 'usd' nahi balki wahi coin code bhejenge.
    // Isse 5 USD ka matlab '5 USDT' hoga, na ki conversion rate wala amount.
    const stableCoins = [
      "usdt",
      "usdttrc20",
      "usdtbsc",
      "usdtmatic",
      "usdtsol",
      "usdtpolygon",
      "usdterc20",
      "usdc",
      "busd",
      "dai",
    ];

    let finalPriceCurrency = "usd"; // Default: Bitcoin waghaira ke liye USD rakhein

    // Agar selected coin stable coin list mein hai, to Exact Amount charge karein
    if (stableCoins.includes(coinApiCode.toLowerCase())) {
      finalPriceCurrency = coinApiCode;
    }

    console.log(
      `[Payment Request] Order: ${orderId} | Price: ${order.priceAtPurchase} | Currency: ${finalPriceCurrency}`
    );

    // --- API CALL ---
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payment`,
      {
        price_amount: order.priceAtPurchase, // e.g. 5.00
        price_currency: finalPriceCurrency, // Ab ye Smart Logic use karega
        pay_currency: coinApiCode, // User ka selected coin
        order_id: order._id.toString(),
        ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,

        // Exact 5 dikhane ke liye False hi rakhna hai
        is_fee_paid_by_user: false,
      },
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );

    // Database update
    order.gatewayPaymentId = response.data.payment_id;
    order.paymentGateway = "NowPayments";
    order.status = "Awaiting-Payment";
    await order.save();

    console.log(
      `[Payment Created] ID: ${response.data.payment_id} | Amount: ${response.data.pay_amount}`
    );
    res.json(response.data);
  } catch (err) {
    const errorResponse = handlePaymentError(err, coinApiCode);
    return res.status(errorResponse.status).json(errorResponse.json);
  }
});

// --- NOWPAYMENTS ROUTE 2: Webhook ---
router.post("/nowpayments/webhook", async (req, res) => {
  try {
    const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
    hmac.update(req.rawBody);
    const signature = hmac.digest("hex");

    if (req.headers["x-nowpayments-sig"] !== signature) {
      console.warn("⚠️ Invalid Webhook Signature.");
      return res.status(401).send("Invalid Signature");
    }
  } catch (e) {
    console.error("Webhook Signature Error:", e.message);
    return res.status(500).send("Verification failed");
  }

  const { payment_status, order_id } = req.body;
  console.log(`[Webhook] Order: ${order_id} | Status: ${payment_status}`);

  try {
    const order = await Order.findOne({ _id: order_id }).populate(
      "product",
      "name"
    );

    if (!order) return res.status(200).send("Order not found, stop retry.");

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

    if (payment_status === "finished" || payment_status === "confirmed") {
      await deliverProduct(order);
      return res.status(200).send("Product delivered.");
    } else {
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
