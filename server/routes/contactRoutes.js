// server/routes/contactRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const ContactLink = require("../models/ContactLink");

// --- PUBLIC ROUTE ---

// ROUTE 1: Get all contact links (Public - Navbar popup ke liye)
// GET /api/contact
router.get("/", async (req, res) => {
  try {
    const links = await ContactLink.find().sort({ type: 1, displayText: 1 });
    res.json(links);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- ADMIN ROUTES (Secured) ---

// ROUTE 2: Get ALL contact links (Admin Panel ke liye)
// GET /api/contact/admin
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const links = await ContactLink.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ROUTE 3: Create a new contact link (Admin)
// POST /api/contact/admin
router.post("/admin", authMiddleware, async (req, res) => {
  const { type, value, displayText } = req.body;

  if (!type || !value || !displayText) {
    return res.status(400).json({ msg: "Please provide all fields" });
  }

  try {
    const newLink = new ContactLink({
      type,
      value,
      displayText,
    });
    const link = await newLink.save();
    res.status(201).json(link);
  } catch (err) {
    console.error("Error adding contact link:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 4: Update a contact link (Admin)
// PUT /api/contact/admin/:id
router.put("/admin/:id", authMiddleware, async (req, res) => {
  const { type, value, displayText } = req.body;

  try {
    let link = await ContactLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ msg: "Contact link not found" });
    }

    // Update fields
    link.type = type;
    link.value = value;
    link.displayText = displayText;

    await link.save();
    res.json(link);
  } catch (err) {
    console.error("Error updating contact link:", err.message);
    res.status(500).send("Server Error");
  }
});

// ROUTE 5: Delete a contact link (Admin)
// DELETE /api/contact/admin/:id
router.delete("/admin/:id", authMiddleware, async (req, res) => {
  try {
    const link = await ContactLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ msg: "Contact link not found" });
    }

    await link.deleteOne();
    res.json({ msg: "Contact link removed" });
  } catch (err) {
    console.error("Error deleting contact link:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
