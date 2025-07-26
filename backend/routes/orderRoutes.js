const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyOrders, checkProductPurchase } = require('../controllers/order');

router.get('/my-orders', protect, getMyOrders);
router.get("/check-purchase/:productId", protect, checkProductPurchase);

module.exports = router;