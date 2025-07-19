const User = require("../models/User");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");

// ✅ Admin Stats
exports.getAdminStats = async (req, res) => {
  const usersCount = await User.countDocuments();
  const productCount = await Product.countDocuments();
  const subscriptionCount = await Subscription.countDocuments({ status: 'active' });

  res.json({
    totalUsers: usersCount,
    totalProducts: productCount,
    activeSubscriptions: subscriptionCount
  });
};

// ✅ Get All Users
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// ✅ Get All Products
exports.getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// ✅ Get All Subscriptions
exports.getAllSubscriptions = async (req, res) => {
  const subs = await Subscription.find().populate("userId", "name email");
  res.json(subs);
};
