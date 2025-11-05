// server/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const Product = require("../models/Product");
const Credential = require("../models/Credential");
const Order = require("../models/Order"); // <-- Order model import karein
const { deliverProduct } = require("../utils/delivery"); // <-- Naya import

// ... (Baaki saare product/credential routes waise hi hain) ...
// ROUTE 1: Add Product...
router.post("/products", authMiddleware, async (req, res) => {
  const { name, description, price, imageUrl, credentialFields } = req.body;
  try {
    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl,
      credentialFields,
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
  const { name, description, price, imageUrl, credentialFields } = req.body;
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
    
    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).send("Server Error");
  }
});

// --- YEH NAYE ROUTES HAIN ---
// ROUTE 8: Get all orders needing approval
// GET /api/admin/orders/processing
router.get("/orders/processing", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ status: "Processing" })
      .populate("product", "name")
      .sort({ createdAt: 1 }); // Sabse purane pehle
    res.json(orders);
  } catch (err) {
    console.error("Error fetching processing orders:", err);
    res.status(500).send("Server Error");
  }
});

// ROUTE 9: Admin approves a manual payment
// POST /api/admin/orders/approve/:id
router.post("/orders/approve/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "product",
      "name"
    );
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    if (order.status !== "Processing") {
      return res.status(400).json({ msg: "Order is not awaiting approval." });
    }

    // Product deliver karein (yeh email bhi bhej dega)
    await deliverProduct(order);

    res.json({ msg: "Order approved and credentials delivered." });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ msg: err.message || "Server Error" });
  }
});
// --- NAYE ROUTES KHATAM ---

module.exports = router;
