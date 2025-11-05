// server/routes/settingsRoutes.js

const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
const authMiddleware = require("../middleware/authMiddleware");

// Helper
const getSettings = async () => {
  const settings = await Setting.find();
  const settingsMap = {};
  settings.forEach((setting) => {
    settingsMap[setting.key] = setting.value === "true";
  });
  return settingsMap;
};

// ROUTE 1: Get PUBLIC Payment Methods (UPDATE HUA)
router.get("/payment-methods", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      binancePayEnabled: settings.binancePayEnabled !== false,
      nowPaymentsEnabled: settings.nowPaymentsEnabled !== false,
      manualPayEnabled: settings.manualPayEnabled !== false,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ROUTE 2: Get ALL Settings (Admin Panel ke liye) (UPDATE HUA)
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      binancePayEnabled: settings.binancePayEnabled !== false,
      nowPaymentsEnabled: settings.nowPaymentsEnabled !== false,
      manualPayEnabled: settings.manualPayEnabled !== false,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ROUTE 3: Update Settings (Koi change nahi)
router.put("/admin", authMiddleware, async (req, res) => {
  // ... (Code waisa hi hai, koi change nahi) ...
  const { key, value } = req.body;
  try {
    await Setting.findOneAndUpdate(
      { key: key },
      { value: String(value) },
      { upsert: true, new: true }
    );
    res.json({ msg: "Setting updated successfully" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
