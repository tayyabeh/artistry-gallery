const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { uploadSingle } = require('../utils/fileUpload.js');
const { check, validationResult } = require('express-validator');

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, displayName } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Also check if username is taken
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Create new user
    user = new User({
      name: displayName || username,
      username,
      email,
      password,
      displayName: displayName || username,
      profileImage: '/images/default-avatar.png'
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.status(500).json({ message: 'Error creating authentication token' });
        }
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Registration error details:', error);
    
    // Check for MongoDB duplicate key error
    if (error.code === 11000) {
      // Extract the duplicate field name
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `That ${field} is already registered. Please use a different ${field}.` 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert to plain object to modify
    const userObj = user.toObject();
    
    // Add full URLs for avatar and cover
    if (userObj.avatar) {
      userObj.avatar = `${req.protocol}://${req.get('host')}${user.avatar}`;
    }
    if (userObj.cover) {
      userObj.coverImage = `${req.protocol}://${req.get('host')}${user.cover}`;
    }
    
    res.json(userObj);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Upload profile photo
router.post('/me/avatar', auth, uploadSingle('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      // Delete the uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile photo if it exists and is not the default
    if (user.avatar && !user.avatar.includes('default-avatar')) {
      const oldAvatarPath = path.join(__dirname, '../../public', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user with new avatar path
    const avatarPath = '/uploads/' + path.basename(req.file.path);
    user.avatar = avatarPath;
    await user.save();

    // Return the full URL for the avatar
    const fullUrl = `${req.protocol}://${req.get('host')}${avatarPath}`;
    res.json({ avatar: fullUrl });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    // Clean up the uploaded file in case of error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading profile photo' });
  }
});

// Upload cover photo
router.post('/me/cover', auth, uploadSingle('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      // Delete the uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old cover photo if it exists
    if (user.cover) {
      const oldCoverPath = path.join(__dirname, '../../public', user.cover);
      if (fs.existsSync(oldCoverPath)) {
        fs.unlinkSync(oldCoverPath);
      }
    }

    // Update user with new cover path
    const coverPath = '/uploads/' + path.basename(req.file.path);
    user.cover = coverPath;
    await user.save();

    // Return the full URL for the cover
    const fullUrl = `${req.protocol}://${req.get('host')}${coverPath}`;
    res.json({ coverImage: fullUrl });
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    // Clean up the uploaded file in case of error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading cover photo' });
  }
});

// Upload cover photo
router.post('/me/cover', auth, uploadSingle('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      // Delete the uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old cover photo if it exists
    if (user.cover) {
      const oldCoverPath = path.join(__dirname, '../../public', user.coverImage);
      if (fs.existsSync(oldCoverPath)) {
        fs.unlinkSync(oldCoverPath);
      }
    }

    // Update user with new cover image path
    const coverPath = '/uploads/' + path.basename(req.file.path);
    user.coverImage = coverPath;
    await user.save();

    res.json({ coverImage: coverPath });
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    // Clean up the uploaded file in case of error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading cover photo' });
  }
});

// Delete profile photo
router.delete('/me/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't delete default avatar
    if (user.avatar && !user.avatar.includes('default-avatar')) {
      const avatarPath = path.join(__dirname, '../../public', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    user.avatar = '/images/default-avatar.png';
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    res.status(500).json({ message: 'Error deleting profile photo' });
  }
});

// Delete cover photo
router.delete('/me/cover', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.cover) {
      const coverPath = path.join(__dirname, '../../public', user.cover);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    user.cover = '';
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cover photo:', error);
    res.status(500).json({ message: 'Error deleting cover photo' });
  }
});

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/:id/artworks
// @desc    Get all artworks uploaded by a user
// @access  Public
router.get('/:id/artworks', async (req, res) => {
  try {
    // Validate user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const artworks = await Artwork.find({ creator: req.params.id })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      count: artworks.length,
      data: artworks
    });
  } catch (error) {
    console.error('Error fetching user artworks:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user artworks'
    });
  }
});

// @route   GET /api/users/:id/orders
// @desc    Get all orders for a user
// @access  Private (user only)
router.get('/:id/orders', auth, async (req, res) => {
  try {
    // Verify user is requesting their own orders
    if (req.params.id !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    const orders = await Order.find({ user: req.params.id })
      .populate('items.artwork', 'title image price')
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user orders'
    });
  }
});

module.exports = router;
