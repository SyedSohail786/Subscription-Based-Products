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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
      },
      startDate: Date,
      endDate: Date,
      active: { type: Boolean, default: false }
    },

    // Purchased or accessible products
    ownedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
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
