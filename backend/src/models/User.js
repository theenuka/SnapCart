const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  preferences: {
    defaultCategory: {
      type: String,
      enum: ['groceries', 'restaurant', 'gas', 'retail', 'pharmacy', 'other'],
      default: 'other'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    autoCategorizationEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);