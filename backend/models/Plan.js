const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Monthly, Yearly, Trial
  price: { type: Number, required: true },
  durationInDays: { type: Number, required: true }, // e.g., 30, 365
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);
