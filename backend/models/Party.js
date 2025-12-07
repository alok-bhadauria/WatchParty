const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const PartySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },

  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  code: { type: String, required: true, unique: true, index: true },

  isPrivate: { type: Boolean, default: false },
  password: { type: String, default: '' },

  settings: {
    allowAnonymous: { type: Boolean, default: false },
    enableChat: { type: Boolean, default: true },
    enableAudio: { type: Boolean, default: true },
    enableVideo: { type: Boolean, default: true },
    enableWhiteboard: { type: Boolean, default: true },
    theme: { type: String, default: 'default' },
    maxParticipants: { type: Number, default: 50 }
  },

  participantsCount: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },

  lastActive: { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PartySchema.pre('save', async function (next) {
  try {
    // If password changed for private party, hash it
    if (this.isModified('password') && this.password && this.password.length > 0) {
      const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
      this.password = hash;
    }

    this.updatedAt = Date.now();
    next();
  } catch (err) {
    next(err);
  }
});

PartySchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Party', PartySchema, 'parties');
