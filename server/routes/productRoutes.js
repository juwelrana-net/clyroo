// server/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/Product");
const Credential = require("../models/Credential");

// ROUTE 1: Get All Products (Homepage ke liye)
// --- YEH ROUTE PHIR SE UPDATE HUA HAI (SEARCH KE LIYE) ---
router.get("/", async (req, res) => {
  try {
    // --- STEP 1: Dono filters ko query se padhein ---
    const { categoryId, search } = req.query;
    const matchStage = {}; // MongoDB match filter

    // --- STEP 2: Category filter logic (jaisa pehle tha) ---
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      matchStage.category = new mongoose.Types.ObjectId(categoryId);
    }

    // --- STEP 3: NAYA SEARCH FILTER LOGIC ---
    // Agar 'search' query hai aur khaali nahi hai
    if (search && search.trim() !== "") {
      // '$regex' ka matlab hai "text contains" (partial match)
      // '$options: "i"' ka matlab hai case-insensitive (e.g., "aws" aur "AWS" dono match honge)
      matchStage.name = { $regex: search.trim(), $options: "i" };
    }
    // --- NAYA LOGIC KHATAM ---

    // Ab `matchStage` mein category aur name, dono filters ho sakte hain

    // Hum Aggregation use karenge (jaisa pehle kiya tha)
    const productsWithStock = await Product.aggregate([
      // Stage 1: Product ko 'matchStage' ke hisaab se filter karein
      { $match: matchStage },

      // Stage 2: Category ka data populate (join) karein
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      // Stage 3: Unsold credentials (stock) ko join karein
      {
        $lookup: {
          from: "credentials",
          localField: "_id",
          foreignField: "product",
          as: "stockItems",
          pipeline: [{ $match: { isSold: false } }],
        },
      },
      // Stage 4: Data ko saaf-suthra banayein
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          imageUrl: 1,
          credentialFields: 1,
          createdAt: 1,
          category: { $arrayElemAt: ["$categoryDetails", 0] },
          stock: { $size: "$stockItems" },
        },
      },
      // Stage 5: Sort karein
      { $sort: { createdAt: -1 } },
    ]);

    res.json(productsWithStock);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error fetching products", error: err });
  }
});
// --- ROUTE 1 UPDATE KHATAM ---

// ROUTE 2: Get a Single Product (Waisa hi rahega)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
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

module.exports = router;
