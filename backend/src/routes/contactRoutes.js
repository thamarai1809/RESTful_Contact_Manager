// src/routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// ➕ Create Contact
router.post("/", async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📄 Read All Contacts (with pagination + search)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const where = search
      ? {
          name: { [require("sequelize").Op.like]: `%${search}%` },
        }
      : {};

    const { count, rows } = await Contact.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    res.json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      contacts: rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Contact
router.put("/:id", async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    await contact.update(req.body);
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Contact
router.delete("/:id", async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    await contact.destroy();
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
