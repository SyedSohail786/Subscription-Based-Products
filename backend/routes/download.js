// routes/download.js
const express = require("express");
const router = express.Router();
const Download = require("../models/Download");
const { protect } = require("../middleware/authMiddleware");

router.post("/log", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    await Download.create({
      user: req.user._id,
      product: productId,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get download history
router.get("/history", protect, async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user._id }).populate("product");
    res.json(downloads);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
