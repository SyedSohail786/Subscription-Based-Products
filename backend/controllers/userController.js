const User = require("../models/User");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const bcrypt = require("bcryptjs");

// 👉 Get Logged In User Info
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
};

// 👉 Dashboard Info
exports.getDashboard = async (req, res) => {
  const user = await User.findById(req.userId);
  const subscription = await Subscription.findOne({ userId: user._id });

  res.json({
    name: user.name,
    email: user.email,
    subscriptionStatus: subscription?.status || "none",
    subscriptionExpires: subscription?.expiresAt || null
  });
};

// 👉 Download Product (check subscription)
exports.downloadProduct = async (req, res) => {
  const { productId } = req.params;
  const subscription = await Subscription.findOne({ userId: req.userId });

  if (!subscription || subscription.status !== "active") {
    return res.status(403).json({ message: "Subscription required to download" });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json({ fileUrl: product.fileUrl });
};

// 👉 Check Subscription Status
exports.getSubscriptionStatus = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.userId });

  if (!sub) {
    return res.json({ status: "none", expiresAt: null });
  }

  res.json({
    status: sub.status,
    expiresAt: sub.expiresAt
  });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
};