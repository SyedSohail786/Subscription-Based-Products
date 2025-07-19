const express = require("express");
const {
  subscribeToPlan,
  getMySubscription,
  createPlan,
  getAllPlans
} = require("../controllers/subscriptionController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// 👤 User
router.post("/subscribe", protect, subscribeToPlan);
router.get("/me", protect, getMySubscription);

// 👑 Admin
router.post("/plans", protect, adminOnly, createPlan);
router.get("/plans", protect, adminOnly, getAllPlans);

module.exports = router;
