const User = require("../models/User");
const Product = require("../models/Product");
const Subscription = require("../models/Subscription");
const Admin = require("../models/Admin");
  const bcrypt = require("bcryptjs");
const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const Category = require("../models/Category");
const Download = require("../models/Download");
const Order = require("../models/Order");

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

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await Admin.findById(req.userId);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect current password" });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
};



// ✅ Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update user details (e.g., name, email, role)
exports.updateUserById = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role; // You can control allowed roles here

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete user
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await Admin.findById(req.userId).select("-password");
  if(!user) return res.status(404).json({ message: "Admin not found" });
  res.json(user);
};

exports.getAdminStates = async (req, res) => {
  try {
    const [
      totalUsers,
      totalSubscriptions,
      totalProducts,
      totalPlans,
      totalCategories,
      totalOrders,
      paymentRevenue,
      orderRevenue,
      topProducts
    ] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments(),
      Product.countDocuments(),
      Plan.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Download.aggregate([
        { $group: { _id: "$product", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
      ])
    ]);

    const combinedRevenue = (paymentRevenue[0]?.total || 0) + (orderRevenue[0]?.total || 0);

    res.json({
      totalUsers,
      totalRevenue: combinedRevenue,
      totalSubscriptions,
      totalProducts,
      totalPlans,
      totalCategories,
      totalOrders,
      topProducts,
    });
  } catch (error) {
    console.error("Analytics error:", error.message);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
}