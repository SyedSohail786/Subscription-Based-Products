const express = require("express");
const {
  getAdminStats,
  getAllUsers,
  getAllProducts,
  getAllSubscriptions
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes protected by admin middleware
router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/products", protect, adminOnly, getAllProducts);
router.get("/subscriptions", protect, adminOnly, getAllSubscriptions);

module.exports = router;
