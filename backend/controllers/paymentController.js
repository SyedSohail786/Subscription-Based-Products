const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Plan = require("../models/Plan");

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

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    // 2. Get Plan Details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }

    // 3. Calculate start and end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationInDays);

    // 4. Update the user's subscription info
    await User.findByIdAndUpdate(userId, {
      subscription: {
        plan: plan._id,
        startDate,
        endDate,
        active: true,
        paymentId: razorpay_payment_id
      }
    });

    return res.status(200).json({ success: true, message: "Payment verified & subscription activated." });
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    return res.status(500).json({ success: false, message: "Server error during payment verification." });
  }
};

