const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const POINTS_MAP = {
  signup_bonus:    50,
  create_post:     10,
  comment:          5,
  like_post:        2,
  daily_login:      5,
};

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { action } = req.body;
    const pts = POINTS_MAP[action];

    if (!pts) return res.status(400).json({ message: 'Unknown action' });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $inc: { points: pts },
        $push: {
          pointsHistory: { action, points: pts }
        }
      },
      { new: true }
    ).select('points walletBalance username');

    res.json({
      points:        user.points,
      walletBalance: user.walletBalance,
      inrValue:      (user.points / 100).toFixed(2),
      added:         pts
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('points walletBalance pointsHistory username');

    res.json({
      points:        user.points,
      walletBalance: user.walletBalance,
      inrValue:      (user.points / 100).toFixed(2),
      history:       user.pointsHistory.slice().reverse()
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
