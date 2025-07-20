const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Subscription = require("../models/Subscription"); // update accordingly
const User = require("../models/User");

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // in rupees

    const options = {
      amount: amount * 100, // convert to paisa
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Razorpay order failed" });
    console.log(err.message);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // ✅ Verified → Activate subscription
    const newSub = new Subscription({
      user: userId,
      plan: planId,
      paymentId: razorpay_payment_id,
      status: "active",
      startedAt: new Date(),
    });
    await newSub.save();

    // Optionally update user:
    await User.findByIdAndUpdate(userId, { activeSubscription: newSub._id });

    // ✅ TODO: Send email confirmation here

    res.status(200).json({ success: true, message: "Payment verified & subscription activated." });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed." });
  }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: "Payment verification failed." });
  }
  
};
