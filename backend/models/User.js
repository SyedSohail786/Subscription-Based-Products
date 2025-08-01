const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },

    // Subscriptions
    subscription: {
      plan: {
        type: mongoose.Schema.Types.ObjectId, default: null,
        ref: 'Plan',
      },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      active: { type: Boolean, default: false },
      paymentId: { type: String, default: null },
    },

    // Free trial tracking
    freeDownloadsUsed: {
      type: Number,
      default: 0,
    },

    // Owned or downloaded products
    ownedProducts: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        description: String,
        imageUrl: String,
        fileUrl: String,
        price: Number,
        category: String,
        createdAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Password hash
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
