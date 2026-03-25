const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl:  { type: String, required: true },
  caption:   { type: String, default: '' },
  viewers:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
}, { timestamps: true });

// Auto-delete expired stories via MongoDB TTL index
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);
