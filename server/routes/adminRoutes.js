// server/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const Product = require("../models/Product");
const Credential = require("../models/Credential");
const Order = require("../models/Order");
const { deliverProduct } = require("../utils/delivery");
const { getChartData } = require("../utils/chartDataHelper");

// ROUTE 1: Add Product...
router.post("/products", authMiddleware, async (req, res) => {
  const { name, description, price, imageUrl, credentialFields, categoryId } =
    req.body;
  try {
    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl,
      credentialFields,
      category: categoryId,
    });
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Error adding product:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 2: Add Credentials...
router.post("/credentials", authMiddleware, async (req, res) => {
  // Front-end se 'productId' aur naya 'credentialData' object lein
  const { productId, credentialData } = req.body;

  // Basic validation
  if (!productId || !credentialData) {
    return res
      .status(400)
      .json({ msg: "Please include a product ID and credential data" });
  }

  try {
    // Check karein ki product ID valid hai
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Naya credential banayein
    const newCredential = new Credential({
      product: productId,
      credentialData: credentialData, // Yeh poora object save hoga
      isSold: false,
    });

    // Save karein
    await newCredential.save();

    res.status(201).json(newCredential);
  } catch (err) {
    console.error("Error adding credential:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 3: Get Credentials...
router.get(
  "/products/:productId/credentials",
  authMiddleware,
  async (req, res) => {
    try {
      // URL se product ki ID lein
      const { productId } = req.params;

      // Us product ID se judi saari credentials ko dhundhein
      // Hum unhe 'createdAt' ke basis par sort karenge (naye wale pehle)
      const credentials = await Credential.find({ product: productId }).sort({
        createdAt: -1,
      });

      res.json(credentials);
    } catch (err) {
      console.error("Error fetching credentials:", err.message);
      res.status(500).send("Server Error");
    }
  }
);

// ROUTE 4: Update Credential...
router.put("/credentials/:id", authMiddleware, async (req, res) => {
  const { credentialData } = req.body;
  try {
    const credential = await Credential.findById(req.params.id);
    if (!credential) {
      return res.status(404).json({ msg: "Credential not found" });
    }

    // Sirf unsold credentials ko hi update kar sakte hain
    if (credential.isSold) {
      return res.status(400).json({ msg: "Cannot edit a sold credential." });
    }

    credential.credentialData = credentialData; // Naya data update karein
    await credential.save();

    res.json(credential);
  } catch (err) {
    console.error("Error updating credential:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 5: Delete Credential...
router.delete("/credentials/:id", authMiddleware, async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);
    if (!credential) {
      return res.status(404).json({ msg: "Credential not found" });
    }
    await credential.deleteOne(); // .remove() deprecated hai
    res.json({ msg: "Credential removed" });
  } catch (err) {
    console.error("Error deleting credential:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 6: Delete Product...
router.delete("/products/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Product delete karein
    await product.deleteOne();

    // Us product se jude saare credentials (stock) bhi delete karein
    await Credential.deleteMany({ product: req.params.id });

    res.json({ msg: "Product and associated credentials removed" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 7: Update Product...
router.put("/products/:id", authMiddleware, async (req, res) => {
  const { name, description, price, imageUrl, credentialFields, categoryId } =
    req.body;
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Nayi details update karein
    product.name = name;
    product.description = description;
    product.price = price;
    product.imageUrl = imageUrl;
    product.credentialFields = credentialFields;
    product.category = categoryId;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 8: MOCK (TEST) ORDER DELIVERY
// Yeh route admin ke liye hai taaki woh manually order ko 'Completed' mark kar sakein
router.get("/test-delivery/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Order ko dhoondhein aur product ka naam bhi le aayein
    const order = await Order.findById(orderId).populate("product", "name");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.status === "Completed") {
      return res.status(400).json({ msg: "Order is already completed" });
    }

    // Server logs mein message daalein
    console.log(`--- MANUAL TEST DELIVERY ---`);
    console.log(`Admin ${req.user.id} is forcing delivery for order ${orderId}`);

    // Seedha 'deliverProduct' function ko call karein
    // Yeh bilkul waisa hi kaam karega jaise NOWPayments ka webhook karta hai
    await deliverProduct(order);

    // Success message bhejein
    res.json({
      msg: "Manual delivery successful. Order is now 'Completed'.",
      order: order, // Updated order wapas bhej dein
    });

  } catch (err) {
    // Agar delivery fail ho (jaise out of stock) toh error log karein
    console.error("Manual test delivery failed:", err.message);
    res.status(500).json({ msg: "Test delivery failed", error: err.message });
  }
});

// ROUTE 9: Get Admin Dashboard Stats
// GET /api/admin/stats?range=30days
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const { range } = req.query;

    // 1. Date Range Filter
    let dateFilter = {};
    const now = new Date();

    if (range === "7days") {
      dateFilter.createdAt = {
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      };
    } else if (range === "30days") {
      dateFilter.createdAt = {
        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };
    } else if (range === "yesterday") {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      yesterday.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      dateFilter.createdAt = { $gte: yesterday, $lt: today };
    }

    // 2. Basic Stats (Revenue & Sales)
    const revenueStatsPromise = Order.aggregate([
      { $match: { status: "Completed", ...dateFilter } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$priceAtPurchase" },
          totalSales: { $sum: 1 },
        },
      },
    ]);

    // 3. Products & Stock Counts
    const totalProductsPromise = Product.countDocuments();
    const totalStockPromise = Credential.countDocuments({ isSold: false });

    // --- NAYA FEATURE 1: Top Selling Categories (Table ke liye) ---
    // Order -> Product -> Category join karke sales count nikalo
    const topCategoriesPromise = Order.aggregate([
      { $match: { status: "Completed", ...dateFilter } },
      // Product join karein
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      // Category join karein
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      // Group by Category Name
      {
        $group: {
          _id: "$categoryInfo.name",
          sales: { $sum: 1 },
          revenue: { $sum: "$priceAtPurchase" },
        },
      },
      { $sort: { sales: -1 } }, // Sabse zyada sales pehle
      { $limit: 5 }, // Top 5 dikhayenge
    ]);

    // --- NAYA FEATURE 2: Stock Distribution (Pie Chart ke liye) ---
    // Credential (Unsold) -> Product -> Category join karke stock count nikalo
    const stockDistributionPromise = Credential.aggregate([
      { $match: { isSold: false } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo.name",
          count: { $sum: 1 },
        },
      },
      // Sort taaki bade hisse pehle dikhein
      { $sort: { count: -1 } },
    ]);

    // Saare promises ek saath run karein (Fast performance)
    const [
      revenueStats,
      totalProducts,
      totalStock,
      topCategories,
      stockDistribution,
    ] = await Promise.all([
      revenueStatsPromise,
      totalProductsPromise,
      totalStockPromise,
      topCategoriesPromise,
      stockDistributionPromise,
    ]);

    // Final Response
    res.json({
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      totalSales: revenueStats[0]?.totalSales || 0,
      totalProducts,
      totalStock,
      // Naye Data Fields
      topCategories: topCategories.map((c) => ({
        name: c._id,
        sales: c.sales,
        revenue: c.revenue,
      })),
      stockDistribution: stockDistribution.map((s) => ({
        name: s._id,
        value: s.count,
      })),
    });
  } catch (err) {
    console.error("Stats fetch error:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 10: Get Admin Dashboard Chart Data
// GET /api/admin/stats/charts?range=30days
router.get("/stats/charts", authMiddleware, async (req, res) => {
  try {
    const { range } = req.query; // '7days', '30days', 'alltime', 'yesterday'
    
    // Helper function ko call karein
    const chartData = await getChartData(Order, range);
    
    res.json(chartData);

  } catch (err) {
    console.error("Chart stats fetch error:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
