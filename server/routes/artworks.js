const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const auth = require('../middleware/auth');

// Get all artworks
router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find()
      .populate('creator', 'displayName profileImage')
      .populate('comments', 'content likes createdAt')
      .sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single artwork
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Fetching artwork with ID:', id);
  
  // Validate ID format (MongoDB ObjectId is 24 hex characters)
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    console.error('Invalid artwork ID format:', id);
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid artwork ID format' 
    });
  }

  try {
    const artwork = await Artwork.findById(id)
      .populate('creator', 'displayName profileImage')
      .populate('comments', 'content likes createdAt');
      
    if (!artwork) {
      console.error('Artwork not found with ID:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Artwork not found',
        id: id
      });
    }
    
    console.log('Successfully found artwork:', artwork._id);
    res.json({
      success: true,
      data: artwork
    });
  } catch (error) {
    console.error('Error fetching artwork:', {
      error: error.message,
      id: id,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching artwork',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create a new artwork
router.post('/', auth, async (req, res) => {
  const artwork = new Artwork({
    ...req.body,
    creator: req.user.id
  });

  try {
    const newArtwork = await artwork.save();
    res.status(201).json(newArtwork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an artwork
router.put('/:id', auth, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    
    // Only allow creator to update
    if (artwork.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Artwork.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ message: 'Artwork updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an artwork
router.delete('/:id', auth, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    
    // Only allow creator to delete
    if (artwork.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
