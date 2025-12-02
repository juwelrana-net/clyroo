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
      return res.status(404).json({ msg: "Valid order not found" });
    }

    if (!coinApiCode) {
      return res.status(400).json({ msg: "Coin API code is required" });
    }

    // 1. Payment Create karne ki koshish karein
    try {
      const response = await axios.post(
        `${NOWPAYMENTS_API_URL}/payment`,
        {
          price_amount: order.priceAtPurchase.toFixed(2), // e.g., 5.00
          price_currency: "usd", // Base currency humesha USD rakhein
          pay_currency: coinApiCode, // e.g., usdttrc20
          order_id: order._id.toString(),
          ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,
          is_fee_paid_by_user: true, // User fee pay karega (Safety ke liye)
        },
        { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
      );

      // Success case
      order.gatewayPaymentId = response.data.payment_id;
      order.paymentGateway = "NowPayments";
      order.status = "Awaiting-Payment";
      await order.save();

      return res.json(response.data);
    } catch (apiError) {
      // 2. Agar "amount too small" error aaye, toh Minimum Amount check karein
      if (apiError.response && apiError.response.data) {
        const { code, message } = apiError.response.data;

        if (message === "amountFrom is too small") {
          console.log(
            `Amount too small for ${coinApiCode}, fetching minimum...`
          );

          // Minimum amount fetch karein NOWPayments se
          try {
            const minRes = await axios.get(
              `${NOWPAYMENTS_API_URL}/min-amount?currency_from=usd&currency_to=${coinApiCode}`,
              { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
            );

            const minAmount = minRes.data.min_amount;

            return res.status(400).json({
              msg: `Minimum payment for ${coinApiCode.toUpperCase()} is $${minAmount}. Please increase quantity or choose a cheaper coin (like TRX/BSC/POLYGON).`,
              minAmount: minAmount,
            });
          } catch (minErr) {
            // Agar min amount fetch na ho paye
            return res.status(400).json({
              msg: `Transaction amount is too small for ${coinApiCode.toUpperCase()}. Try USDT-TRC20 or USDT-BSC.`,
              error: apiError.response.data,
            });
          }
        }
        // Koi aur API error ho toh
        throw apiError;
      }
      throw apiError;
    }
  } catch (err) {
    console.error("--- NOWPAYMENTS CREATE ERROR ---");
    // Detailed error logging
    if (err.response) {
      console.error("Data:", err.response.data);
      console.error("Status:", err.response.status);
    } else {
      console.error("Message:", err.message);
    }

    res.status(500).json({
      msg: err.response?.data?.message || "Failed to create payment invoice.",
      error: err.response ? err.response.data : err.message,
    });
  }
});

// --- NOWPAYMENTS ROUTE 2: Webhook ---
// (Baaki webhook code same rahega jaisa pehle tha, usme change ki zarurat nahi hai)
router.post("/nowpayments/webhook", async (req, res) => {
  try {
    const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
    hmac.update(req.rawBody);
    const signature = hmac.digest("hex");
    if (req.headers["x-nowpayments-sig"] !== signature) {
      return res.status(401).send("Invalid Signature");
    }
  } catch (e) {
    return res.status(500).send("Signature verification failed");
  }

  const { payment_status, order_id } = req.body;

  try {
    const order = await Order.findOne({ _id: order_id }).populate(
      "product",
      "name"
    );

    if (!order) return res.status(200).send("Order not found");

    if (
      [
        "Completed",
        "Failed",
        "Partially_paid",
        "Cancelled",
        "Expired",
      ].includes(order.status)
    ) {
      return res.status(200).send("Order already processed");
    }

    if (payment_status === "finished" || payment_status === "confirmed") {
      await deliverProduct(order);
      return res.status(200).send("Delivered");
    } else {
      order.status = payment_status;
      await order.save();
      res.status(200).send(`Status updated to ${payment_status}`);
    }
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
