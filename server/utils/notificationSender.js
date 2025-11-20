// server/utils/notificationSender.js

const admin = require("firebase-admin"); // Firebase Admin SDK
const AdminDevice = require("../models/AdminDevice"); // Admin device tokens
const SiteSettings = require("../models/SiteSettings"); // Site settings model
const sendEmail = require("./sendEmail"); // Hamara email helper
const axios = require("axios"); // Telegram ke liye

// --- Helper 1: PUSH NOTIFICATION (UPDATED FIX) ---
const sendPushNotification = async (order, settings) => {
  if (!settings.enablePushNotifications) {
    console.log("Push notifications are disabled. Skipping.");
    return;
  }

  try {
    const adminDevices = await AdminDevice.find({}, "fcmToken");
    if (adminDevices.length === 0) {
      console.log("No admin devices found for push notification.");
      return;
    }

    const tokens = adminDevices.map((device) => device.fcmToken);

    // Message payload
    const message = {
      notification: {
        title: "🎉 New Sale!",
        body: `Product: ${order.product.name} (Qty: ${order.quantity}) - $${order.priceAtPurchase}`,
      },
      tokens: tokens, // Saare tokens yahan hain
      webpush: {
        notification: {
          icon: "https://clyroo-server-uorp.onrender.com/favicon.ico",
        },
      },
      data: {
        orderId: order._id.toString(),
        click_action: `${process.env.APP_BASE_URL}/admin/dashboard`,
      },
    };

    console.log(`Sending push notification to ${tokens.length} device(s)...`);

    // --- FIX: sendMulticast ki jagah sendEachForMulticast use karein ---
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(
      "Push notification sent. Success count:",
      response.successCount
    );

    // Failed tokens ko remove karein
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          // Error log karein taaki debug kar sakein
          console.error(`Failure for token at index ${idx}:`, resp.error);
          failedTokens.push(tokens[idx]);
        }
      });
      if (failedTokens.length > 0) {
        await AdminDevice.deleteMany({ fcmToken: { $in: failedTokens } });
        console.log(`Removed ${failedTokens.length} invalid tokens.`);
      }
    }
  } catch (error) {
    console.error("Error sending push notification:", error.message);
  }
};

// --- Helper 2: EMAIL NOTIFICATION ---
const sendEmailNotification = async (order, settings) => {
  if (!settings.enableEmailNotifications) {
    console.log("Email notifications are disabled. Skipping.");
    return;
  }

  try {
    const adminEmail = settings.adminNotificationEmail;
    if (!adminEmail) {
      console.log("Admin notification email is not set. Skipping.");
      return;
    }

    console.log(`Sending email notification to ${adminEmail}...`);
    const subject = `🎉 New Sale! Order: ${order._id}`;
    const html = `<h1>New Sale!</h1>
                  <p>Product: <b>${order.product.name}</b></p>
                  <p>Quantity: <b>${order.quantity}</b></p>
                  <p>Value: <b>$${order.priceAtPurchase.toFixed(2)}</b></p>
                  <p>Customer: ${order.customerEmail}</p>`;

    await sendEmail(adminEmail, subject, html);
    console.log(`Email sent successfully to ${adminEmail}`);
  } catch (error) {
    console.error("Error sending email notification:", error.message);
  }
};

// --- Helper 3: TELEGRAM NOTIFICATION ---
const sendTelegramNotification = async (order, settings) => {
  if (!settings.enableTelegramNotifications) {
    console.log("Telegram notifications are disabled. Skipping.");
    return;
  }

  const { telegramBotToken, telegramChatId } = settings;

  if (!telegramBotToken || !telegramChatId) {
    console.log("Telegram Bot Token or Chat ID is missing. Skipping.");
    return;
  }

  try {
    console.log(
      `Sending Telegram notification to Chat ID: ${telegramChatId}...`
    );

    // Telegram message (Markdown format)
    let text = `🎉 *New Sale!*\n\n`;
    text += `*Product:* ${order.product.name}\n`;
    text += `*Quantity:* ${order.quantity}\n`;
    text += `*Value:* $${order.priceAtPurchase.toFixed(2)}\n`;
    text += `*Customer:* ${order.customerEmail}`;

    // Telegram API URL
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    await axios.post(url, {
      chat_id: telegramChatId,
      text: text,
      parse_mode: "Markdown", // Formatting ke liye
    });
    console.log("Telegram notification sent successfully.");
  } catch (error) {
    console.error(
      "Error sending Telegram notification:",
      error.response ? error.response.data : error.message
    );
  }
};

// --- MAIN FUNCTION ---
const sendAdminNotifications = async (order) => {
  console.log("Sending admin notifications for order:", order._id);

  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      console.log("Site settings not found. No notifications will be sent.");
      return;
    }

    await Promise.allSettled([
      sendPushNotification(order, settings),
      sendEmailNotification(order, settings),
      sendTelegramNotification(order, settings),
    ]);

    console.log("Admin notifications processed.");
  } catch (error) {
    console.error("Failed to fetch settings for notifications:", error.message);
  }
};

module.exports = { sendAdminNotifications };
