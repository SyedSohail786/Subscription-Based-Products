const express = require("express");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryById
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCategories); // Public
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);
router.get("/:id", getCategoryById);
module.exports = router;
