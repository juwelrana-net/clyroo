// server/models/SiteSettings.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const siteSettingsSchema = new Schema({
  // --- Push Notification ---
  enablePushNotifications: {
    type: Boolean,
    default: true,
  },

  // --- Email Notification ---
  enableEmailNotifications: {
    type: Boolean,
    default: false, // Default off rakhte hain
  },
  adminNotificationEmail: {
    type: String,
    trim: true,
    default: "admin@example.com", // Ek default email
  },

  // --- Telegram Notification ---
  enableTelegramNotifications: {
    type: Boolean,
    default: false,
  },
  telegramBotToken: {
    type: String,
    trim: true,
  },
  telegramChatId: {
    type: String,
    trim: true,
  },
});

/*
 * Yeh model ek "Singleton" ki tarah use hoga.
 * Matlab, poore database mein iska SIRF EK document hoga
 * jo saari site settings ko hold karega.
 */

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

module.exports = SiteSettings;
