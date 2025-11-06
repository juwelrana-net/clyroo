// server/routes/cryptoPaymentRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const CryptoPayment = require("../models/CryptoPayment"); // Yeh naya model hai

// ROUTE 1: Get all ENABLED payment methods (Public)
// Yeh route client ko dikhayega ki kaun se coins ON hain
// GET /api/payment-methods
router.get("/", async (req, res) => {
  try {
    const methods = await CryptoPayment.find({ isEnabled: true }).sort({
      name: 1,
    });
    res.json(methods);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- ADMIN ROUTES ---

// ROUTE 2: Get ALL payment methods (Admin)
// Yeh route admin panel ko saare coins (on/off) dikhayega
// GET /api/payment-methods/admin
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const methods = await CryptoPayment.find().sort({ createdAt: -1 });
    res.json(methods);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ROUTE 3: Create a new payment method (Admin)
// Admin panel se naya coin add karne ke liye
// POST /api/payment-methods/admin
router.post("/admin", authMiddleware, async (req, res) => {
  // Hum 'type' ko hamesha 'nowpayments' set karenge, jaisa aapne kaha
  const { name, apiCode, iconUrl } = req.body;

  try {
    const newMethod = new CryptoPayment({
      name, // e.g., "USDT (TRC20)"
      type: "nowpayments", // Hamesha automatic
      apiCode, // e.g., "usdterc20"
      iconUrl, // e.g., "/images/coins/usdt.svg"
      isEnabled: true, // Default ON rakhenge
    });
    const method = await newMethod.save();
    res.status(201).json(method);
  } catch (err) {
    console.error("Error adding payment method:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 4: Update a payment method (Admin)
// Coin ka naam, code, icon, ya status (on/off) update karne ke liye
// PUT /api/payment-methods/admin/:id
router.put("/admin/:id", authMiddleware, async (req, res) => {
  const { name, apiCode, iconUrl, isEnabled } = req.body;

  try {
    let method = await CryptoPayment.findById(req.params.id);
    if (!method) {
      return res.status(404).json({ msg: "Payment method not found" });
    }

    // Update fields
    method.name = name;
    method.type = "nowpayments"; // Ensure type stays correct
    method.apiCode = apiCode;
    method.iconUrl = iconUrl;
    method.isEnabled = isEnabled;

    await method.save();
    res.json(method);
  } catch (err) {
    console.error("Error updating payment method:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 5: Delete a payment method (Admin)
// Coin ko delete karne ke liye
// DELETE /api/payment-methods/admin/:id
router.delete("/admin/:id", authMiddleware, async (req, res) => {
  try {
    const method = await CryptoPayment.findById(req.params.id);
    if (!method) {
      return res.status(404).json({ msg: "Payment method not found" });
    }

    await method.deleteOne();
    res.json({ msg: "Payment method removed" });
  } catch (err) {
    console.error("Error deleting payment method:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
