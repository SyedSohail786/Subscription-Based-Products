const Coupon = require("../models/Coupon");

// 👉 Admin: Create Coupon
exports.createCoupon = async (req, res) => {
  const { code, discountType, discountValue, expiresAt, usageLimit } = req.body;

  const exists = await Coupon.findOne({ code });
  if (exists) return res.status(400).json({ message: "Coupon already exists" });

  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    expiresAt,
    usageLimit
  });

  res.status(201).json(coupon);
};

// 👉 Admin: Get All Coupons
exports.getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find();
  res.json(coupons);
};

// 👉 Admin: Delete Coupon
exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  res.json({ message: "Coupon deleted successfully" });
};

// 👉 User: Apply Coupon
exports.applyCoupon = async (req, res) => {
  const { code } = req.body;
  const userId = req.userId;

  const coupon = await Coupon.findOne({ code });

  if (!coupon) return res.status(404).json({ message: "Invalid coupon" });

  if (new Date(coupon.expiresAt) < new Date()) {
    return res.status(400).json({ message: "Coupon expired" });
  }

  if (coupon.usedBy.includes(userId)) {
    return res.status(400).json({ message: "You have already used this coupon" });
  }

  if (coupon.usageLimit <= coupon.usedBy.length) {
    return res.status(400).json({ message: "Coupon usage limit exceeded" });
  }

  // If valid, store user and return discount details
  coupon.usedBy.push(userId);
  await coupon.save();

  res.json({
    success: true,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue
  });
};
