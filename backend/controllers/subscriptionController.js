const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const sendEmail = require("../utils/sendEmail");

// 💳 User subscribes to a plan
exports.subscribeToPlan = async (req, res) => {
  const { planId } = req.body;
  const userId = req.userId;

  const plan = await Plan.findById(planId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + plan.durationInDays);

  const subscription = await Subscription.create({
    user: userId,
    plan: planId,
    startDate,
    endDate,
    isActive: true
  });

  await sendEmail(
    req.user.email,
    "🎉 Subscription Activated",
    `<h2>Hi ${req.user.name}</h2>
     <p>You are now subscribed to <strong>${plan.name}</strong>.</p>
     <p>Expires on: ${endDate.toDateString()}</p>`
  );

  res.status(201).json({ message: "Subscription successful", subscription });
};

// 🧠 User gets their active subscription
exports.getMySubscription = async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.userId,
    isActive: true,
    endDate: { $gte: new Date() }
  }).populate("plan");

  if (!subscription) return res.status(404).json({ message: "No active subscription" });

  res.json(subscription);
};

// 🛠 Admin creates new plan
exports.createPlan = async (req, res) => {
  const { name, price, durationInDays, description } = req.body;

  const plan = await Plan.create({ name, price, durationInDays, description });
  res.status(201).json(plan);
};

// 🛠 Admin gets all plans
exports.getAllPlans = async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
};
