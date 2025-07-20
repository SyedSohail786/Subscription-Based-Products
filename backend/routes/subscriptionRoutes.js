const express = require("express");
const {
  subscribeToPlan,
  getMySubscription,
  createPlan,
  getAllPlans,
  getAllSubscriptions
} = require("../controllers/subscriptionController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// 👤 User
router.post("/subscribe", protect, subscribeToPlan);
router.get("/me", protect, getMySubscription);

// 👑 Admin
router.post("/plans", protect, adminOnly, createPlan);
router.get("/plans", protect, adminOnly, getAllPlans);
router.get("/", protect, adminOnly, getAllSubscriptions);

module.exports = router;
