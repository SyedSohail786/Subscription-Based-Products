const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    tags: [String],
    author: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    returnAvailable: { type: Boolean, default: false },
    about: { type: String, required: true },
    fileUrl: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
