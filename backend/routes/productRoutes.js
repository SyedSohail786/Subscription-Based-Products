const express = require("express");
const {
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProduct
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin-only
router.post('/', protect, adminOnly,upload.fields([{ name: 'file', maxCount: 1 },{ name: 'image', maxCount: 1 },]),createProduct);
router.put("/:id", protect, adminOnly,upload.fields([{ name: 'file', maxCount: 1 },{ name: 'image', maxCount: 1 },]), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
