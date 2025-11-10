// server/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const Product = require("../models/Product");
const Credential = require("../models/Credential");
const Order = require("../models/Order");

// --- YEH NAYA IMPORT ADD KAREIN ---
const { deliverProduct } = require("../utils/delivery");

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

// --- YEH NAYA ROUTE FILE KE END MEIN ADD KAREIN (module.exports se pehle) ---

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

module.exports = router;
