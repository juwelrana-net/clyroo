// server/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const Product = require("../models/Product");
const Credential = require("../models/Credential");
const Order = require("../models/Order");

// ROUTE 1: Create a new PENDING order
router.post("/create", async (req, res) => {
  const { productId, quantity, customerEmail } = req.body;
  if (!productId || !quantity || !customerEmail) {
    return res
      .status(400)
      .json({ msg: "Please include product ID, quantity, and email" });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ msg: "Product not found" });
    }
    const stockCount = await Credential.countDocuments({
      product: productId,
      isSold: false,
    }).session(session);
    if (stockCount < quantity) {
      await session.abortTransaction();
      return res.status(400).json({ msg: "Not enough stock available" });
    }

    // Naya secret token banayein
    const accessToken = crypto.randomBytes(32).toString("hex");

    const newOrder = new Order({
      product: productId,
      quantity: quantity,
      customerEmail: customerEmail,
      priceAtPurchase: product.price * quantity,
      status: "Pending",
      customerAccessToken: accessToken, // Token ko yahaan save karein
    });

    const order = await newOrder.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Poora order object wapas bhejein (jismein naya token bhi hai)
    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation failed:", err.message);
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Order creation failed. Server error.");
  }
});

// ROUTE 2: Get Order Details
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "product",
      "name imageUrl"
    );
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    if (order.status === "Completed" || order.status === "Cancelled") {
      return res.status(400).json({ msg: "This order is already processed." });
    }
    res.json(order);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.status(500).send("Server Error");
  }
});

// ROUTE 5: Get Order Status (Public Confirmation)
router.get("/status/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "product",
      "name" // Sirf product ka naam chahiye
    );

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Sirf safe data wapas bhejein
    res.json({
      _id: order._id,
      status: order.status,
      productName: order.product ? order.product.name : "Unknown Product",
      priceAtPurchase: order.priceAtPurchase,
      customerEmail: order.customerEmail,
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.status(500).send("Server Error");
  }
});

// ROUTE 6: Get COMPLETED Order Details (Securely)
// Yeh route naye success page ke liye hai
router.get("/complete/:id/token/:token", async (req, res) => {
  try {
    const { id, token } = req.params;

    // Order ko ID aur secret token, dono se dhundhein
    const order = await Order.findOne({
      _id: id,
      customerAccessToken: token, // Token bhi match hona zaroori hai
    }).populate({
      path: "deliveredCredentials", // Credentials ka poora data fetch karein
      select: "credentialData", // Sirf credentialData field chahiye
    });

    // Agar order nahi mila (ya token galat hai)
    if (!order) {
      return res.status(404).json({ msg: "Order not found or access denied." });
    }

    // Agar order "Completed" nahi hai, toh credentials na dikhayein
    // "Processing" waala check yahaan se hata diya gaya hai
    if (order.status !== "Completed") {
      return res.status(400).json({
        msg: `Your order is ${order.status}. Credentials are not available yet.`,
        status: order.status,
      });
    }

    // Success! Safe data aur credentials wapas bhejein
    res.json({
      _id: order._id,
      status: order.status,
      customerEmail: order.customerEmail,
      deliveredCredentials: order.deliveredCredentials, // Yeh array bhej dein
    });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Order not found." });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
