const User = require("../models/User");
const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const Plan = require("../models/Plan");

// 👉 Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    // 🔐 Auto-assign Trial Plan
    const trialPlan = await Plan.findOne({ name: "Trial" });
    if (!trialPlan) return res.status(500).json({ message: "Trial plan not found" });

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + trialPlan.durationInDays);

    user.subscription = {
      plan: trialPlan._id,
      startDate: now,
      endDate,
      active: true
    };

    await user.save();

    generateToken(res, user._id, 'user');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      subscription: user.subscription
    });

  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// 👉 Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  generateToken(res, user._id, 'user');
  res.json({ _id: user._id, name: user.name, email: user.email });
};

// 👉 Logout User
exports.logoutUser = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
};

// 👉 Get Current User
exports.getMe = async (req, res) => {
  let user = await User.findById(req.userId).select("-password");
  if(user===null){
    user = await Admin.findById(req.userId).select("-password");
  }
  res.json(user);
};

// 👉 Admin Login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }
  generateToken(res, admin._id, 'admin');
  res.json({ _id: admin._id, email: admin.email });
};

// 👉 Logout Admin
exports.logoutAdmin = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Admin logged out" });
};
