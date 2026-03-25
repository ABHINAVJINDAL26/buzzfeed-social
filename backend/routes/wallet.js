const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('username points walletBalance pointsHistory');

    res.json({
      username:      user.username,
      points:        user.points,
      inrValue:      (user.points / 100).toFixed(2),
      walletBalance: user.walletBalance.toFixed(2),
      history:       user.pointsHistory.slice(-10).reverse()
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/convert', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (user.points < 100) {
      return res.status(400).json({ message: 'Minimum 100 points required to convert' });
    }

    const convertedINR = Math.floor(user.points / 100);
    const remainingPts = user.points % 100;

    user.points        = remainingPts;
    user.walletBalance = parseFloat((user.walletBalance + convertedINR).toFixed(2));
    user.pointsHistory.push({ action: 'convert_to_inr', points: -(user.points - remainingPts) });
    await user.save();

    res.json({
      message:       `Converted to ₹${convertedINR}`,
      points:        user.points,
      walletBalance: user.walletBalance.toFixed(2),
      inrValue:      (user.points / 100).toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
