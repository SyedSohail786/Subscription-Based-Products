const User = require("../models/User");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const bcrypt = require("bcryptjs");
const Plan = require("../models/Plan");
const Download = require("../models/Download");

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
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ canDownload: false, message: "User not found" });
    }

    // Load subscription plan details
    const planId = user.subscription.plan;
    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ canDownload: false, message: "Plan not found" });
    }

    const isFree = plan.name === "Trial" || plan.name === "Free";
    const isSubscribed = !isFree && user.subscription.active;

    // Case 1: User owns the product or has an active paid subscription
    const hasAccess =
      user.ownedProducts.some(p => p._id.toString() === productId) || isSubscribed;

    if (hasAccess) {
      const download = await Download.create({
        userId: user._id,
        product: productId,
        downloadDate: new Date()
      });
      return res.status(200).json({ canDownload: true });
    }

    // Case 2: Free trial users with limited downloads
    if (isFree) {
      const used = user.freeDownloadsUsed || 0;
      const limit = 5;

      if (used >= limit) {
        return res.status(201).json({
          canDownload: false,
          message: "Free trial limit reached. Please subscribe.",
          downloadsLeft: 0
        });
      }

      user.freeDownloadsUsed = used + 1;
      await user.save();
      const download = await Download.create({
        userId: user._id,
        product: productId,
        downloadDate: new Date()
      });

      return res.status(200).json({
        canDownload: true,
        message: `Free trial download allowed (${user.freeDownloadsUsed}/${limit} used).`,
        downloadsLeft: limit - user.freeDownloadsUsed
      });
    }

    // Fallback
    return res.status(403).json({ canDownload: false, message: "Access denied." });

  } catch (error) {
    console.error("Download access error:", error.message);
    res.status(500).json({ canDownload: false, message: "Server error" });
  }
};

exports.addToLibrary = async (req, res) => {
  const userId = req.userId;
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user already owns the product
    const user = await User.findById(userId);
    const alreadyOwned = user.ownedProducts.some(
      (p) => p._id.toString() === productId
    );
    if (alreadyOwned) {
      return res.status(400).json({ message: "Product already in library." });
    }

    await User.findByIdAndUpdate(
      userId,
      { $push: { ownedProducts: product } },
      { new: true }
    );

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

exports.removeFromLibrary = async (req, res) => {
  const user = await User.findById(req.userId);
  user.ownedProducts = user.ownedProducts.filter(product => product._id.toString() !== req.params.productId);
  await user.save();
  res.status(200).json({ message: "Product removed from your library." });
};
