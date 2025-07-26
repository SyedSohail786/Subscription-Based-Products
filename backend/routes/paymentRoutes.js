const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, createProductOrder, verifyProductPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

router.post("/create-product-order", protect, createProductOrder);
router.post("/verify-product", protect, verifyProductPayment);
module.exports = router;
