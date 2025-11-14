// server/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/Product");
const Credential = require("../models/Credential");

// ROUTE 1: Get All Products (Homepage ke liye)
// --- YEH ROUTE POORA UPDATE HUA HAI ---
router.get("/", async (req, res) => {
  try {
    // Filter logic
    const { categoryId } = req.query;
    const matchStage = {}; // MongoDB match filter

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      matchStage.category = new mongoose.Types.ObjectId(categoryId);
    }

    // Hum Aggregation use karenge taaki stock count (N+1 query) ko fix kar sakein
    const productsWithStock = await Product.aggregate([
      // Stage 1: Sirf category match waale product dhoondein (agar filter hai)
      { $match: matchStage },
      // Stage 2: Category ka data populate (join) karein
      {
        $lookup: {
          from: "categories", // 'categories' collection
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      // Stage 3: Unsold credentials (stock) ko join karein
      {
        $lookup: {
          from: "credentials", // 'credentials' collection
          localField: "_id",
          foreignField: "product",
          as: "stockItems",
          pipeline: [
            { $match: { isSold: false } }, // Sirf unsold waale
          ],
        },
      },
      // Stage 4: Data ko saaf-suthra banayein
      {
        $project: {
          // Product ke saare fields
          name: 1,
          description: 1,
          price: 1,
          imageUrl: 1,
          credentialFields: 1,
          createdAt: 1,
          // Category ko array se object banayein
          category: { $arrayElemAt: ["$categoryDetails", 0] },
          // Stock count ko calculate karein
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
