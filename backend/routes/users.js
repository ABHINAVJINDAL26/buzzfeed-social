const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/profile/:username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username followers following createdAt')
      .populate('followers', 'username')
      .populate('following', 'username');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const followers = (user.followers || []).map((entry) => ({
      userId: entry._id,
      username: entry.username
    }));

    const following = (user.following || []).map((entry) => ({
      userId: entry._id,
      username: entry.username
    }));
    
    res.json({
      username: user.username,
      followersCount: followers.length,
      followingCount: following.length,
      followers,
      following,
      joined: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
