const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");

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

    const subscription = new Subscription({
      user: userId,
      plan: plan._id,
      startDate,
      endDate,
      active: true,
      paymentId: razorpay_payment_id
    });
    await subscription.save();  

    const payment = new Payment({
      user: userId,
      plan: plan._id,
      amount: plan.price,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });
    await payment.save();


    return res.status(200).json({ success: true, message: "Payment verified & subscription activated." });
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    return res.status(500).json({ success: false, message: "Server error during payment verification." });
  }
};




// Product Payment Routes
exports.createProductOrder = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const options = {
      amount: product.price * 100, // convert to paisa
      currency: "INR",
      receipt: `receipt_product_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ ...order, productId });
  } catch (err) {
    res.status(500).json({ error: "Razorpay order failed" });
    console.log(err.message);
  }
};

// Verify Product Payment
exports.verifyProductPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId } = req.body;
    const userId = req.userId;

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    // Get product details - using new ObjectId
    const product = await Product.findById(new mongoose.Types.ObjectId(productId));
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Save order details
    const order = new Order({
      user: new mongoose.Types.ObjectId(userId),
      product: new mongoose.Types.ObjectId(productId),
      amount: product.price,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: "completed",
      productDetails: {
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        fileUrl: product.fileUrl,
      },
    });
    await order.save();

    return res.status(200).json({ 
      success: true, 
      message: "Payment verified & product purchased.",
      orderId: order._id
    });
  } catch (error) {
    console.error("Error verifying product payment:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during payment verification." 
    });
  }
};