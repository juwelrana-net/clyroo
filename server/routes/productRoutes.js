// server/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/Product");
const Credential = require("../models/Credential");
// Order model ki yahaan zaroorat nahi hai
// const Order = require("../models/Order");

// ROUTE 1: Get All Products (Homepage ke liye)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const stockCount = await Credential.countDocuments({
          product: product._id,
          isSold: false,
        });

        const productObject = product.toObject();
        return {
          ...productObject,
          stock: stockCount,
        };
      })
    );

    res.json(productsWithStock);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error fetching products", error: err });
  }
});

// ROUTE 2: Get a Single Product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const stockCount = await Credential.countDocuments({
      product: product._id,
      isSold: false,
    });

    const productObject = product.toObject();
    res.json({ ...productObject, stock: stockCount });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Error fetching product", error: err });
  }
});

// ROUTE 3 (Jo pehle POST /order tha) ab yahaan se hata diya gaya hai
// Kyunki yeh logic 'server/routes/orderRoutes.js' mein chala gaya hai.

module.exports = router;
