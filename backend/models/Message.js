const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    senderName: {
      type: String,
      default: 'Anonymous',
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'system'],
      default: 'text'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

MessageSchema.index({ party: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema, 'messages');
