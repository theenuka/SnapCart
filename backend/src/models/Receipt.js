const mongoose = require('mongoose');

const receiptItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
});

const receiptSchema = new mongoose.Schema({
  storeName: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  items: [receiptItemSchema],
  subtotal: {
    type: Number,
    min: 0
  },
  tax: {
    type: Number,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['groceries', 'restaurant', 'gas', 'retail', 'pharmacy', 'other'],
    default: 'other'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital', 'other'],
    default: 'other'
  },
  imagePath: {
    type: String,
    required: true
  },
  ocrText: {
    type: String
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate total from items if not provided
receiptSchema.pre('save', function(next) {
  if (!this.total && this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + (this.tax || 0);
  }
  next();
});

// Add indexes for better query performance
receiptSchema.index({ userId: 1, date: -1 });
receiptSchema.index({ category: 1 });
receiptSchema.index({ processingStatus: 1 });

module.exports = mongoose.model('Receipt', receiptSchema);