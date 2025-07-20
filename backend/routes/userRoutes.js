const express = require("express");
const {
  getProfile,
  getDashboard,
  downloadProduct,
  getSubscriptionStatus,
  changePassword,
  checkDownloadAccess,
  addToLibrary,
  getOwnedProducts,
  removeFromLibrary
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getProfile);
router.get("/dashboard", protect, getDashboard);
router.get("/download/:productId", protect, downloadProduct);
router.get("/subscription", protect, getSubscriptionStatus);
router.put("/change-password", protect, changePassword);
router.get("/check-access/:productId", protect, checkDownloadAccess);
router.get("/owned-products", protect, getOwnedProducts);
router.post("/add-to-library/:productId", protect, addToLibrary);
router.post("/remove-from-library/:productId", protect, removeFromLibrary);


module.exports = router;
