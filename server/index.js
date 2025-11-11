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
const cryptoPaymentRoutes = require("./routes/cryptoPaymentRoutes"); // <-- Naya route

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/payment-methods", cryptoPaymentRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Simple health check endpoint
app.get("/", (req, res) => {
  res.send("Server is running");
});


// --- YEH NAYA TEMPORARY DEBUG ROUTE ADD KAREIN ---
// WARNING: Isse sirf testing ke liye rakhein, fir delete kar dein!
app.get("/secret-check-debug", (req, res) => {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  res.send({
    // Poora secret nahi dikhayenge, sirf shuru aur aakhir ka part
    secret_from_server_start: secret ? secret.substring(0, 8) : "NOT_SET", 
    secret_from_server_end: secret ? secret.slice(-4) : "NOT_SET",
    // Poora secret bhi bhej dete hain taaki aap copy kar saken
    full_secret_for_copy: secret, 
  });
});
// --- DEBUG ROUTE KHATAM ---

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
