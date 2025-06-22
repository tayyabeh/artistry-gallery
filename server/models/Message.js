const mongoose = require('mongoose');

const { Schema, Types } = mongoose;

/**
 * Message schema
 * conversation: parent conversation id
 * sender: user who sent
 * content: text body (optional if media present)
 * mediaUrl/type: optional attachment
 * readBy: array of user ids who have read the message (for receipts)
 * createdAt index for ordering
 */
const MessageSchema = new Schema(
  {
    conversation: {
      type: Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    mediaUrl: String,
    mediaType: String, // e.g. image, video, file
    readBy: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
