const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyOrders } = require('../controllers/order');

router.get('/my-orders', protect, getMyOrders);

module.exports = router;