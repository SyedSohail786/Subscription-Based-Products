const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  applyCoupon
} = require("../controllers/couponController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// 🎯 User
router.post("/apply", protect, applyCoupon);

// 🛠 Admin
router.post("/", protect, adminOnly, createCoupon);
router.get("/", protect, adminOnly, getAllCoupons);
router.delete("/:id", protect, adminOnly, deleteCoupon);

module.exports = router;
