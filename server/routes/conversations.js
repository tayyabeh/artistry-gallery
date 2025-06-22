const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// GET /api/conversations - list user's conversations
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ participants: userId })
      .populate({ path: 'participants', select: 'username avatar displayName' })
      .populate({ path: 'lastMessage', select: 'content mediaType createdAt' })
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    console.error('Get conversations error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/conversations - create or fetch existing 1-1 conversation
router.post('/', auth, async (req, res) => {
  try {
    const { participantId } = req.body; // ID of other user
    const userId = req.user.id;
    if (!participantId) return res.status(400).json({ msg: 'participantId required' });

    // Check if conversation already exists
    let conv = await Conversation.findOne({ participants: { $all: [userId, participantId], $size: 2 } });
    if (!conv) {
      conv = await Conversation.create({ participants: [userId, participantId] });
    }
    // Ensure participants are populated
    conv = await Conversation.findById(conv._id)
      .populate({ path: 'participants', select: 'username avatar displayName' })
      .populate({ path: 'lastMessage', select: 'content mediaType createdAt' });
    res.status(201).json(conv);
  } catch (err) {
    console.error('Create conversation error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
