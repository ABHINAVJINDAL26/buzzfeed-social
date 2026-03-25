const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/profile/:username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username followers following createdAt');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      username: user.username,
      followers: user.followers.length,
      following: user.following.length,
      joined: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
