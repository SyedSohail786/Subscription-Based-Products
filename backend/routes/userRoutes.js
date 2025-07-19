const express = require("express");
const {
  getProfile,
  getDashboard,
  downloadProduct,
  getSubscriptionStatus,
  changePassword
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getProfile);
router.get("/dashboard", protect, getDashboard);
router.get("/download/:productId", protect, downloadProduct);
router.get("/subscription", protect, getSubscriptionStatus);
router.put("/change-password", protect, changePassword);

module.exports = router;
