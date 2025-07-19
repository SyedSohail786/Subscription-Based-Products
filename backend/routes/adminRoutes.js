const express = require("express");
const {
  getAdminStats,
  getAllUsers,
  getAllProducts,
  getAllSubscriptions,
  changePassword,
  getUserById,
  updateUserById,
  deleteUserById
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes protected by admin middleware
router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/products", protect, adminOnly, getAllProducts);
router.get("/subscriptions", protect, adminOnly, getAllSubscriptions);
router.put("/change-password", protect, changePassword);

router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id", protect, adminOnly, updateUserById);
router.delete("/users/:id", protect, adminOnly, deleteUserById);

module.exports = router;
