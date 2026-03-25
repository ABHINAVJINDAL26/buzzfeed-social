const express = require('express');
const router  = express.Router();
const Story   = require('../models/Story');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/stories  — fetch all non-expired stories (newest first)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(stories);
  } catch {
    res.status(500).json({ message: 'Failed to fetch stories' });
  }
});

// POST /api/stories  — create a story (imageUrl required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { imageUrl, caption = '' } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });

    const story = await Story.create({
      author:   req.user.userId,
      imageUrl: imageUrl.trim(),
      caption:  String(caption).trim()
    });
    await story.populate('author', 'username');
    res.status(201).json(story);
  } catch {
    res.status(500).json({ message: 'Failed to create story' });
  }
});

// PUT /api/stories/:id/view  — mark story as viewed by current user
router.put('/:id/view', authMiddleware, async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, {
      $addToSet: { viewers: req.user.userId }
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Failed to mark view' });
  }
});

// DELETE /api/stories/:id  — delete own story
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Not found' });
    if (story.author.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });
    await story.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete story' });
  }
});

module.exports = router;
