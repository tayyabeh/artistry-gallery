const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

// GET /api/messages/:conversationId - fetch messages for conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate({ path: 'sender', select: 'username avatar displayName' });
    res.json(messages);
  } catch (err) {
    console.error('Get messages error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/messages - send message
router.post('/', auth, async (req, res) => {
  try {
    const { conversationId, content, mediaUrl, mediaType } = req.body;
    if (!conversationId || (!content && !mediaUrl)) {
      return res.status(400).json({ msg: 'Invalid payload' });
    }
    const newMessage = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content,
      mediaUrl,
      mediaType,
    });

    // Update conversation metadata
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: newMessage._id, updatedAt: new Date() });

    const populated = await newMessage.populate({ path: 'sender', select: 'username avatar displayName' }).execPopulate?.();

    // TODO: emit via socket.io later

    res.status(201).json(populated || newMessage);
  } catch (err) {
    console.error('Send message error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
