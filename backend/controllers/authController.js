const User = require("../models/User");
const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");


//user register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    // 📧 Send welcome email
    const emailHtml = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
    <div style="background-color: #4f46e5; padding: 16px; border-radius: 6px 6px 0 0; color: white; text-align: center;">
      <h2 style="margin: 0;">Welcome to Digital Store 🎉</h2>
    </div>

    <div style="padding: 20px; background: white; border: 1px solid #ddd;">
      <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
      
      <p style="font-size: 15px;">
        We're excited to have you on board! Your account has been successfully created.
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.FRONTEND_URL}" target="_blank" style="padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Store</a>
      </div>

      <p style="font-size: 14px; color: #555;">
        If you have any questions, feel free to reply to this email or reach out to our support team.
      </p>

      <p style="font-size: 14px; margin-top: 20px;">Best regards,<br><strong>Team Digital Store</strong></p>
    </div>

    <div style="text-align: center; font-size: 12px; color: #888; margin-top: 12px;">
      © ${new Date().getFullYear()} Digital Store. All rights reserved.
    </div>
  </div>
`;

    await sendEmail(email, "Welcome to Digital Store 🎉", emailHtml);

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

//user login
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
  if (user === null) {
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
