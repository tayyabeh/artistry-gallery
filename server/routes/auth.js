const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({ name, email, password, phone });
    await user.save();
    
    res.status(201).json({ 
      message: 'Registration successful! Please sign in',
      userId: user._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Something went wrong',
      error: error.message 
    });
  }
});

// Signin route
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Something went wrong',
      error: error.message 
    });
  }
});

module.exports = router;
