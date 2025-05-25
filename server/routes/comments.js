const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Artwork = require('../models/Artwork');
const auth = require('../middleware/auth');

// Get all comments for an artwork
router.get('/artwork/:artworkId', async (req, res) => {
  try {
    const comments = await Comment.find({ artwork: req.params.artworkId })
      .populate('user', 'displayName profileImage')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to an artwork
router.post('/', auth, async (req, res) => {
  const { content, artworkId } = req.body;

  try {
    // First check if the artwork exists
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    const comment = new Comment({
      content,
      artwork: artworkId,
      user: req.user.id
    });

    const savedComment = await comment.save();
    
    // Add comment to artwork's comments array
    await Artwork.findByIdAndUpdate(
      artworkId, 
      { $push: { comments: savedComment._id } }
    );

    // Populate user data
    await savedComment.populate('user', 'displayName profileImage');
    
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only allow comment author to delete
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Remove comment from artwork's comments array
    await Artwork.findByIdAndUpdate(
      comment.artwork,
      { $pull: { comments: comment._id } }
    );

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like a comment
router.put('/like/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    res.json({ message: 'Comment liked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
