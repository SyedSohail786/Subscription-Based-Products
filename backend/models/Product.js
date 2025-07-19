const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  price: Number,
  fileUrl: String,
  imageUrl: String,
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
