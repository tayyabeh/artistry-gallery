const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const router = express.Router();
const Artwork = require('../models/Artwork');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET /api/artworks
// @desc    Get all artworks with optional filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, sort } = req.query;
    
    // Build query object
    const query = {};
    
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) query.category = categoryDoc._id;
    }
    
    if (featured === 'true') query.isFeatured = true;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { views: -1 };
    if (sort === 'likes') sortOption = { likes: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    
    const artworks = await Artwork.find(query)
      .populate('creator', 'displayName avatar')
      .populate('category', 'name slug')
      .sort(sortOption);
      
    res.json({
      success: true,
      count: artworks.length,
      data: artworks
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching artworks'
    });
  }
});

// @route   GET /api/artworks/category/:slug
// @desc    Get artworks by category slug
// @access  Public
router.get('/category/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const artworks = await Artwork.find({ category: category._id })
      .populate('creator', 'displayName avatar')
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      category: category.name,
      count: artworks.length,
      data: artworks
    });
  } catch (error) {
    console.error('Error fetching artworks by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category artworks'
    });
  }
});

// @route   POST /api/artworks
// @desc    Create new artwork
// @access  Private (artist)
router.post('/', 
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('image', 'Image URL is required').not().isEmpty(),
    check('price').optional().isFloat({ min: 0 }),
    check('category', 'Category is required').not().isEmpty()
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
      const { title, image, description, price, category, tags, licenseType } = req.body;
      
      
        
      
      // Resolve category (accept slug or ObjectId)
      let categoryDoc;
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findById(category);
      } else {
        categoryDoc = await Category.findOne({ slug: category });
      }
      if (!categoryDoc) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }

      // Handle base64 image uploads by saving to public/uploads
      let imageUrl = image;
      if (typeof image === 'string' && image.startsWith('data:image')) {
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({ success: false, message: 'Invalid image data' });
        }
        const mime = matches[1];
        const base64Data = matches[2];
        const ext = mime.split('/')[1] || 'png';
        const buffer = Buffer.from(base64Data, 'base64');
        const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filename = `artwork_${Date.now()}.${ext}`;
        fs.writeFileSync(path.join(uploadsDir, filename), buffer);
        imageUrl = `/uploads/${filename}`;
      }

      const newArtwork = new Artwork({
        title,
        image: imageUrl,
        description,
        price: price ?? 0,
        category: categoryDoc._id,
        tags: tags || [],
        licenseType: licenseType || 'standard',
        creator: req.user.id
      });

      const artwork = await newArtwork.save();
      
      res.status(201).json({
        success: true,
        data: artwork
      });
    } catch (error) {
      console.error('Error creating artwork:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating artwork'
      });
    }
  }
);

// @route   GET /api/artworks/:id
// @desc    Get single artwork
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate('creator', 'displayName avatar')
      .populate('category', 'name slug');
      
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    
    // Increment view count
    artwork.views += 1;
    await artwork.save();
    
    res.json({
      success: true,
      data: artwork
    });
  } catch (error) {
    console.error('Error fetching artwork:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching artwork'
    });
  }
});

// @route   PUT /api/artworks/:id
// @desc    Update artwork
// @access  Private (artist)
router.put('/:id', 
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('image', 'Image URL is required').not().isEmpty(),
    check('price').optional().isFloat({ min: 0 }),
    check('category', 'Category is required').not().isEmpty()
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
      const artwork = await Artwork.findById(req.params.id);
      
      if (!artwork) {
        return res.status(404).json({
          success: false,
          message: 'Artwork not found'
        });
      }
      
      // Only allow creator to update
      if (artwork.creator.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized'
        });
      }
      
      const { title, image, description, price, category, tags, licenseType } = req.body;
      
      // Verify category exists
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
      
      artwork.title = title;
      artwork.image = image;
      artwork.description = description;
      artwork.price = price;
      artwork.category = categoryDoc._id;
      artwork.tags = tags || [];
      artwork.licenseType = licenseType || 'standard';
      
      await artwork.save();
      
      res.json({
        success: true,
        message: 'Artwork updated successfully'
      });
    } catch (error) {
      console.error('Error updating artwork:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating artwork'
      });
    }
  }
);

// @route   DELETE /api/artworks/:id
// @desc    Delete artwork
// @access  Private (artist)
router.delete('/:id', auth, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    
    // Only allow creator to delete
    if (artwork.creator.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    await Artwork.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Artwork deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting artwork'
    });
  }
});

module.exports = router;
