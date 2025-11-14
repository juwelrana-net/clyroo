// server/routes/siteSettingsRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const SiteSettings = require("../models/SiteSettings");

// Yeh helper function hai taaki settings document hamesha available rahe
// Yeh database se settings ko fetch (ya create) karega
const getSettings = async () => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    // Agar settings maujood nahi hain, toh naya banayein
    console.log("No site settings found, creating new default settings...");
    settings = new SiteSettings({}); // Default values model se aa jayengi
    await settings.save();
  }
  return settings;
};

// --- ADMIN ROUTES (Secured) ---

// ROUTE 1: Get current site settings (Admin Panel ke liye)
// GET /api/settings/admin
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err) {
    console.error("Error fetching site settings:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 2: Update site settings (Admin Panel se save karne ke liye)
// PUT /api/settings/admin
router.put("/admin", authMiddleware, async (req, res) => {
  try {
    // req.body se woh saari fields le lo jo admin bhej raha hai
    // Jaise: enablePushNotifications, telegramBotToken, etc.
    const { ...updatedFields } = req.body;

    // Hamesha 'findOne' karke 'save' karein, 'findOneAndUpdate' na karein
    // taaki agar naya document banana pade toh logic fail na ho.
    let settings = await getSettings();

    // Har field ko update karein
    Object.assign(settings, updatedFields);

    // Nayi settings ko save karein
    await settings.save();

    res.json(settings); // Updated settings wapas bhejein
  } catch (err) {
    console.error("Error updating site settings:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
