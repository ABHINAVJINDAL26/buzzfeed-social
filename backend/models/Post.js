const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

const pollOptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    voters: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      username: {
        type: String,
        required: true,
        trim: true
      }
    },
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    likes: {
      type: [String],
      default: []
    },
    comments: {
      type: [commentSchema],
      default: []
    },
    pollOptions: {
      type: [pollOptionSchema],
      default: []
    },
    isPromotion: {
      type: Boolean,
      default: false
    },
    promotionData: {
      appName: String,
      title: String,
      description: String,
      buttonText: String,
      category: String,
      link: String
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Post', postSchema);
