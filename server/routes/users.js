const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

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
    res.json(user);
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

module.exports = router;
