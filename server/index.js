// server/index.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Routes ko import karein
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
// settingsRoutes ko yahaan se hata diya gaya hai
const cryptoPaymentRoutes = require("./routes/cryptoPaymentRoutes");
const contactRoutes = require("./routes/contactRoutes");

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
