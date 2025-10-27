const express = require("express");
const router = express.Router();
// Use Mongoose model defined in backend/src/models/Contact.js
const Contact = require("../models/Contact");

// --- UTILITY FUNCTIONS ---
/**
 * @desc Standardizes error handling and response logic.
 * @param {object} res - Express response object.
 * @param {Error} err - Error object.
 */
const handleError = (res, err) => {
  console.error(err.message);
  // Use status 400 for client errors (validation) and 500 for server errors
  const statusCode = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500;
  res.status(statusCode).json({ error: err.message });
};


// ➕ Create Contact
router.post("/", async (req, res) => {
  try {
    // Basic Mongoose create method
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (err) {
    handleError(res, err);
  }
});

// 📄 Read All Contacts (with pagination + search)
router.get("/", async (req, res) => {
  try {
    // Parse query parameters and set defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10; // Increased limit default for better UI
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build Mongoose Query object for searching name
    const query = search
      ? {
          name: { $regex: new RegExp(search, "i") }, // Case-insensitive search
        }
      : {};

    // 1. Get total count of documents matching the query
    const totalCount = await Contact.countDocuments(query);

    // 2. Fetch contacts with search, pagination (skip/limit), and sorting
    const contacts = await Contact.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 }); // Sort by name ascending

    res.json({
      total: totalCount,
      page: page,
      pages: Math.ceil(totalCount / limit),
      contacts: contacts,
    });
  } catch (err) {
    handleError(res, err);
  }
});

// ✏️ Update Contact
router.put("/:id", async (req, res) => {
  try {
    // Find contact by ID and update it in one operation (Mongoose equivalent of findByPk + update)
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // { new: true } returns the updated document; { runValidators: true } ensures schema validation runs on update
    );

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(contact);
  } catch (err) {
    handleError(res, err);
  }
});

// ❌ Delete Contact
router.delete("/:id", async (req, res) => {
  try {
    // Find contact by ID and delete it in one operation
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully", deletedContact: contact });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
