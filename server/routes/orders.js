const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Artwork = require('../models/Artwork');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   POST /api/orders
// @desc    Place a new order
// @access  Private
router.post('/', 
  [
    auth,
    check('items', 'Order items are required').isArray({ min: 1 }),
    check('paymentMethod', 'Payment method is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    try {
      const { items, paymentMethod, billingAddress, shippingAddress } = req.body;
      
      // Validate and calculate order totals
      let subtotal = 0;
      const validatedItems = [];
      
      for (const item of items) {
        const artwork = await Artwork.findById(item.artwork);
        
        if (!artwork) {
          return res.status(400).json({
            success: false,
            message: `Artwork not found: ${item.artwork}`
          });
        }
        
        if (!artwork.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `Artwork not available for purchase: ${artwork.title}`
          });
        }
        
        const orderItem = {
          artwork: artwork._id,
          price: artwork.price,
          licenseType: item.licenseType || 'standard',
          downloadLink: `https://api.artistryhub.com/downloads/${artwork._id}/${Date.now()}`,
          downloadExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
        
        subtotal += artwork.price;
        validatedItems.push(orderItem);
      }
      
      // Calculate tax (simplified for example)
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;
      
      // Create order
      const order = new Order({
        user: req.user.id,
        items: validatedItems,
        subtotal,
        tax,
        total,
        paymentMethod,
        billingAddress,
        shippingAddress,
        status: 'pending'
      });
      
      await order.save();
      
      // Clear user's cart if this was from a cart
      if (req.body.fromCart) {
        await Cart.findOneAndUpdate(
          { user: req.user.id },
          { $set: { items: [], subtotal: 0 } }
        );
      }
      
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while placing order'
      });
    }
  }
);

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.artwork', 'title image price');
    
    res.json({ 
      success: true, 
      count: orders.length,
      data: orders 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details
// @access  Private (user or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.artwork', 'title image price');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Verify user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
    
    res.json({ 
      success: true, 
      data: order 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
