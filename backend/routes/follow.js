const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/follow/:userId  — follow or unfollow toggle
router.post('/:userId', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user.userId)
      return res.status(400).json({ message: "Can't follow yourself" });

    const me = await User.findById(req.user.userId);
    const isFollowing = me.following.map(id => id.toString()).includes(targetId);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user.userId, { $pull: { following: targetId } });
      await User.findByIdAndUpdate(targetId,     { $pull: { followers: req.user.userId } });
      return res.json({ following: false, message: 'Unfollowed' });
    } else {
      await User.findByIdAndUpdate(req.user.userId, { $addToSet: { following: targetId } });
      await User.findByIdAndUpdate(targetId,     { $addToSet: { followers: req.user.userId } });
      return res.json({ following: true, message: 'Followed' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/follow/:userId/stats  — followers / following count
router.get('/:userId/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      followers: user.followers.length,
      following: user.following.length,
      username:  user.username
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
