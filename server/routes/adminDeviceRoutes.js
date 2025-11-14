// server/routes/adminDeviceRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const AdminDevice = require("../models/AdminDevice");

// ROUTE 1: Admin ke naye device token ko register/save karna
// POST /api/admin/register-device
router.post("/register-device", authMiddleware, async (req, res) => {
  const { fcmToken } = req.body;
  const userId = req.user.id; // Yeh token authMiddleware se mila

  if (!fcmToken) {
    return res.status(400).json({ msg: "FCM Token is required" });
  }

  try {
    // Hum 'upsert' logic ka istemaal karenge:
    // Agar token pehle se hai, toh 'userId' update kar do (taaki wahi admin use kar sake)
    // Agar token naya hai, toh naya document bana do
    const device = await AdminDevice.findOneAndUpdate(
      { fcmToken: fcmToken }, // Is token ko dhoondo
      { userId: userId }, // Aur usse is admin user se link kar do
      { new: true, upsert: true, setDefaultsOnInsert: true } // `upsert: true` naya bana dega agar nahi mila
    );

    res.status(201).json({ msg: "Device registered successfully", device });
  } catch (err) {
    // Agar token unique nahi hai (duplicate key error)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ msg: "This device is already registered by another user." });
    }
    console.error("Device registration failed:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
