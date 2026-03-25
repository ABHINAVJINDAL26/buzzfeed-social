const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      unique: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    points: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0.00 },
    pointsHistory: [
      {
        action: { type: String },
        points: { type: Number },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    followers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isOnline:     { type: Boolean, default: false },
    lastSeen:     { type: Date, default: Date.now },
    streak:       { type: Number, default: 0 },
    lastPostDate: { type: Date }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('User', userSchema);
