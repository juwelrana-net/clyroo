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

// Base fiat currency (NOWPayments panel me bhi tumne USD rakha hai)
const BASE_FIAT_CURRENCY = (
  process.env.NOWPAYMENTS_BASE_FIAT_CURRENCY || "usd"
).toLowerCase();

/**
 * NOTE:
 *  - price_amount  => tumhare store ka amount (e.g. 5.00)
 *  - price_currency => fiat (usd)
 *  - pay_currency   => user ka coin (usdtbsc, usdtmatic, ...)
 */

// ------------------ CREATE INVOICE ------------------ //
router.post("/nowpayments/create", async (req, res) => {
  const { orderId, coinApiCode } = req.body;

  try {
    if (!orderId || !coinApiCode) {
      return res.status(400).json({
        msg: "Order ID aur coin API code dono required hain.",
      });
    }

    const order = await Order.findById(orderId);
    if (!order || order.status !== "Pending") {
      return res.status(404).json({ msg: "Valid order nahi mila." });
    }

    // Price sanity check
    const rawPrice = Number(order.priceAtPurchase);
    if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
      return res.status(400).json({
        msg: "Invalid order price. Please contact support.",
      });
    }

    // EXACT 2 decimal places (5 -> 5.00, 5.5 -> 5.50)
    const priceAmount = Number(rawPrice.toFixed(2));

    const payload = {
      price_amount: priceAmount,
      price_currency: BASE_FIAT_CURRENCY, // "usd"
      pay_currency: coinApiCode, // e.g. "usdtbsc" / "usdtmatic"
      order_id: order._id.toString(),
      ipn_callback_url: `${process.env.APP_BASE_URL}/api/payment/nowpayments/webhook`,
      is_fee_paid_by_user: true, // fee user pay karega
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

    return res.json(response.data);
  } catch (err) {
    console.error("--- NOWPAYMENTS CREATE ERROR ---");
    const providerErr = err.response?.data;
    if (providerErr) console.error(providerErr);
    else console.error(err.message);

    const providerMessage = providerErr?.message || "";
    const lowerMsg = providerMessage.toLowerCase();

    // yahi error tum log me dekh rahe ho: amountFrom/amountTo is too small
    if (
      lowerMsg.includes("amountfrom is too small") ||
      lowerMsg.includes("amountto is too small")
    ) {
      return res.status(400).json({
        msg:
          "Selected coin ke liye NOWPayments ka minimum amount isse zyada hai. " +
          "Please price ya quantity badhao, ya koi aur coin select karo.",
        code: "MIN_AMOUNT_TOO_SMALL",
        providerMessage,
      });
    }

    return res.status(500).json({
      msg: "Failed to create NOWPayments invoice.",
      code: providerErr?.code || "NOWPAYMENTS_ERROR",
      providerError: providerErr || err.message,
    });
  }
});

// ------------------ WEBHOOK ------------------ //
router.post("/nowpayments/webhook", async (req, res) => {
  // yahan rawBody already index.js me set ho raha hai
  try {
    const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
    hmac.update(req.rawBody);
    const signature = hmac.digest("hex");

    if (req.headers["x-nowpayments-sig"] !== signature) {
      console.error("!!! INVALID WEBHOOK SIGNATURE !!!");
      console.error(
        "NOWPayments se mila header:",
        req.headers["x-nowpayments-sig"]
      );
      console.error("Humne jo calculate kiya:", signature);

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
      return res.status(200).send("Webhook received, order not found.");
    }

    if (
      order.status === "Completed" ||
      order.status === "Failed" ||
      order.status === "Partially_paid" ||
      order.status === "Cancelled" ||
      order.status === "Expired"
    ) {
      return res
        .status(200)
        .send("Webhook received, but order already processed or failed.");
    }

    if (payment_status === "finished" || payment_status === "confirmed") {
      await deliverProduct(order);
      return res.status(200).send("Webhook received and product delivered.");
    } else {
      order.status = payment_status;
      await order.save();

      return res
        .status(200)
        .send(
          `Webhook received and order status updated to ${payment_status}.`
        );
    }
  } catch (err) {
    console.error("NOWPayments Webhook DB Error:", err);
    return res.status(500).send("Server error processing webhook");
  }
});

module.exports = router;
