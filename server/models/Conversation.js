const mongoose = require('mongoose');

const { Schema, Types } = mongoose;

/**
 * Conversation schema
 * participants: array of user ObjectIds participating in the conversation
 * lastMessage: ref to the latest message doc (for fast list retrieval)
 * isGroup: optional flag for group chats (future use)
 * name / avatar: group chat metadata (future use)
 * updatedAt: auto-managed by Mongoose (last message time)
 */
const ConversationSchema = new Schema(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: Types.ObjectId,
      ref: 'Message',
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    name: String,
    avatar: String,
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

ConversationSchema.index({ participants: 1 }); // for quick participant searches

module.exports = mongoose.model('Conversation', ConversationSchema);
