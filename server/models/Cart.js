const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  artwork: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: [true, 'Artwork reference is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  licenseType: {
    type: String,
    enum: ['standard', 'extended', 'exclusive'],
    default: 'standard'
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
