const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
    const filter = req.query.filter || 'all';
    const search = (req.query.search || '').trim();

    const query = {};

    if (search) {
      query.$or = [
        { 'author.username': { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } }
      ];
    }

    const sortMap = {
      all: { createdAt: -1 },
      foryou: { createdAt: -1 },
      liked: { likesCount: -1, createdAt: -1 },
      commented: { commentsCount: -1, createdAt: -1 },
      shared: { createdAt: -1 }
    };

    const normalizedFilter = String(filter).toLowerCase();
    const selectedSort = sortMap[normalizedFilter] || sortMap.all;

    const pipeline = [
      { $match: query },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' }
        }
      },
      { $sort: selectedSort },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    const [posts, totalItemsResult] = await Promise.all([
      Post.aggregate(pipeline),
      Post.aggregate([
        { $match: query },
        { $count: 'count' }
      ])
    ]);

    const totalItems = totalItemsResult[0]?.count || 0;

    return res.json({
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      items: posts
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text = '', imageUrl = '', pollOptions = [], isPromotion = false, promotionData = null } = req.body;
    const trimmedText = String(text).trim();
    const trimmedImageUrl = String(imageUrl).trim();

    if (!trimmedText && !trimmedImageUrl && pollOptions.length === 0 && !isPromotion) {
      return res.status(400).json({ message: 'Content is required to create a post' });
    }

    const post = await Post.create({
      author: {
        userId: new mongoose.Types.ObjectId(req.user.userId),
        username: req.user.username
      },
      text: trimmedText,
      imageUrl: trimmedImageUrl,
      pollOptions: Array.isArray(pollOptions) ? pollOptions.map(String) : [],
      isPromotion: Boolean(isPromotion),
      promotionData: isPromotion ? promotionData : null,
      likes: [],
      comments: []
    });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create post' });
  }
});

router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likedByUser = post.likes.includes(req.user.username);
    if (likedByUser) {
      post.likes = post.likes.filter((username) => username !== req.user.username);
    } else {
      post.likes.push(req.user.username);
    }

    await post.save();
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to toggle like' });
  }
});

router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const trimmedText = String(text || '').trim();

    if (!trimmedText) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      username: req.user.username,
      text: trimmedText
    });

    await post.save();
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add comment' });
  }
});

module.exports = router;
