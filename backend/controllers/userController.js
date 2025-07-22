const User = require("../models/User");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const bcrypt = require("bcryptjs");
const Plan = require("../models/Plan");

// 👉 Get Logged In User Info
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  const plan = await Plan.findById(user.subscription.plan);
  user.subscription.plan = plan;
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

exports.checkDownloadAccess = async (req, res) => {
  const userId = req.userId;
  const { productId } = req.params;

  const user = await User.findById(userId);

  const hasAccess = user.ownedProducts.includes(productId) || (user.subscription?.active ?? false);

  if (hasAccess) {
    return res.status(200).json({ canDownload: true });
  } else {
    return res.status(403).json({ canDownload: false });
  }
};

exports.addToLibrary = async (req, res) => {
  const userId = req.userId;
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  try {
    await User.findByIdAndUpdate(userId, {ownedProducts: product}, {new: true});
    res.status(200).json({ message: "Product added to your library." });
  } catch (err) {
    console.error("Add to library error:", err);
    res.status(500).json({ error: "Failed to add product to library." });
  }
};

exports.getOwnedProducts = async (req, res) => {
  const user = await User.findById(req.userId).populate("ownedProducts", "_id");
  res.json({ ownedProducts: user.ownedProducts });
};

// exports.addToLibrary = async (req, res) => {
//   await User.findByIdAndUpdate(req.userId, {
//     $addToSet: { ownedProducts: req.params.productId }
//   });
//   res.status(200).json({ message: "Product added to your library." });
// };

exports.removeFromLibrary = async (req, res) => {
  const user = await User.findById(req.userId);
  user.ownedProducts = user.ownedProducts.filter(product => product._id.toString() !== req.params.productId);
  await user.save();
  res.status(200).json({ message: "Product removed from your library." });
};
