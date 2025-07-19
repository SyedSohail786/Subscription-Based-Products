const express = require("express");
const {
  createCategory,
  getCategories
} = require ("../controllers/categoryController.js");
const { protect, adminOnly } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Admin only
router.post("/", protect, adminOnly, createCategory);

// Public
router.get("/", getCategories);

module.exports=router;
