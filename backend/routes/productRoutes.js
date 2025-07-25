const express = require("express");
const {
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProduct,
  recentlyViewed,
  getRecentlyViewed
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const Product = require('../models/Product');

const router = express.Router();

// Public

// Admin-only
router.post('/', protect, adminOnly,upload.fields([{ name: 'file', maxCount: 1 },{ name: 'image', maxCount: 1 },]),createProduct);
router.put("/:id", protect, adminOnly,upload.fields([{ name: 'file', maxCount: 1 },{ name: 'image', maxCount: 1 },]), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);



// Save product view (call on product detail visit)
router.post('/recently-viewed', protect, recentlyViewed);

// Get recently viewed products
router.get('/recently-viewed', protect, getRecentlyViewed);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

module.exports = router;

