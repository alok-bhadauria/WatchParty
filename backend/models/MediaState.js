const mongoose = require('mongoose');

const MediaStateSchema = new mongoose.Schema(
  {
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Party',
      required: true,
      unique: true,
      index: true
    },
    videoUrl: {
      type: String,
      default: ''
    },
    provider: {
      type: String,
      enum: ['youtube', 'direct', 'drive', 'other'],
      default: 'other'
    },
    currentTime: {
      type: Number,
      default: 0
    },
    isPlaying: {
      type: Boolean,
      default: false
    },
    playbackRate: {
      type: Number,
      default: 1
    },
    volume: {
      type: Number,
      default: 1
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model('MediaState', MediaStateSchema, 'media_states');
