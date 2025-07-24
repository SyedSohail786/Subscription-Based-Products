// routes/commentRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createComment,
  getCommentsForProduct,
} = require("../controllers/commentController");

router.post("/:productId", protect, createComment);
router.get("/:productId", getCommentsForProduct);

module.exports = router;
