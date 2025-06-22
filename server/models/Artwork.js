const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  thumbnail: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category reference is required']
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    required: [true, 'Price is required']
  },
  isDigital: {
    type: Boolean,
    default: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  licenseType: {
    type: String,
    enum: ['standard', 'extended', 'exclusive'],
    default: 'standard'
  }
}, { timestamps: true });

module.exports = mongoose.model('Artwork', artworkSchema);
