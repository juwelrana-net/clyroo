// server/index.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Firebase Admin SDK
const admin = require("firebase-admin");
// Render secret files ko hamesha /etc/secrets/ folder mein rakhta hai
const serviceAccount = require("/etc/secrets/serviceAccountKey.json");

// Routes ko import karein
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cryptoPaymentRoutes = require("./routes/cryptoPaymentRoutes");
const contactRoutes = require("./routes/contactRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminDeviceRoutes = require("./routes/adminDeviceRoutes");
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminControlRoutes = require("./routes/adminControlRoutes");

const app = express();

// Middleware
app.use(
  express.json({
    // verify function se hum raw request body ko access kar sakte hain
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/webhook")) {
        req.rawBody = buf.toString(); // Raw data ko req.rawBody mein save karein
      }
    },
  })
);
app.use(cors());

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/payment-methods", cryptoPaymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminDeviceRoutes);
app.use("/api/settings", siteSettingsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin-control", adminControlRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Simple health check endpoint
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
