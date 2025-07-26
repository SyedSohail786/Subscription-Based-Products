const User = require("../models/User");
const Comment = require("../models/Comment");

exports.createComment = async (req, res) => {
  try {
    const { productId } = req.params;
    const { text, rating } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Please provide a valid rating (1-5)" });
    }

    // Check if user owns the product
    const user = await User.findById(req.user._id);
    const ownsProduct = user.ownedProducts.some(p => p._id.toString() === productId);

    if (!ownsProduct) {
      return res.status(403).json({ message: "Only certified buyers can review this product" });
    }

    const comment = await Comment.create({
      user: req.user._id,
      product: productId,
      text: text.trim(),
      rating
    });

    const populatedComment = await comment.populate("user", "name email");

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("Error posting comment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCommentsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({ product: productId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const averageRating = comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length;

    res.status(200).json({
      comments,
      averageRating: comments.length > 0 ? averageRating.toFixed(1) : 0,
      totalReviews: comments.length
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Server error" });
  }
};