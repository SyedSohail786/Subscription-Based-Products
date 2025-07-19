// models/Download.js
const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Download", downloadSchema);
