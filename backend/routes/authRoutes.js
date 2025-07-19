const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  loginAdmin,
  logoutAdmin
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// 🧑 User Auth
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/logout", logoutUser);
router.get("/user/me", protect, getMe);

// 🛠 Admin Auth
router.post("/admin/login", loginAdmin);
router.post("/admin/logout", logoutAdmin);

module.exports = router;
