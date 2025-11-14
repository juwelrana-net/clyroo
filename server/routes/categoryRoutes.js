// server/routes/categoryRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Category = require("../models/Category");
const Product = require("../models/Product"); // Product model check karne ke liye

// --- PUBLIC ROUTE ---

// ROUTE 1: Get all categories (Public - Home page filters ke liye)
// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- ADMIN ROUTES (Secured) ---

// ROUTE 2: Get ALL categories (Admin Panel ke liye)
// GET /api/categories/admin
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ROUTE 3: Create a new category (Admin)
// POST /api/categories/admin
router.post("/admin", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ msg: "Please provide a category name" });
  }

  try {
    // Check karein ki category pehle se hai
    let category = await Category.findOne({ name });
    if (category) {
      return res.status(400).json({ msg: "Category already exists" });
    }

    const newCategory = new Category({ name });
    category = await newCategory.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("Error adding category:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 4: Update a category (Admin)
// PUT /api/categories/admin/:id
router.put("/admin/:id", authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }
    category.name = name;
    await category.save();
    res.json(category);
  } catch (err) {
    console.error("Error updating category:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 5: Delete a category (Admin)
// DELETE /api/categories/admin/:id
router.delete("/admin/:id", authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    // --- Safety Check ---
    // Check karein ki koi product is category ko use toh nahi kar raha
    const productCount = await Product.countDocuments({
      category: req.params.id,
    });
    if (productCount > 0) {
      return res.status(400).json({
        msg: `Cannot delete category. ${productCount} product(s) are using it.`,
      });
    }
    // --- Safety Check End ---

    await category.deleteOne();
    res.json({ msg: "Category removed" });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
