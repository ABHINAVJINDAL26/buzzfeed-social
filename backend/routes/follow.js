const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Friendship = require('../models/Friendship');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/follow/:userId  — send/cancel follow request (request-based)
router.post('/:userId', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user.userId)
      return res.status(400).json({ message: "Can't follow yourself" });

    const meId = req.user.userId;

    const me = await User.findById(meId).select('following');
    const alreadyFollowing = me.following.map((id) => id.toString()).includes(targetId);
    if (alreadyFollowing) {
      return res.json({
        status: 'following',
        message: 'Already following'
      });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: meId, recipient: targetId },
        { requester: targetId, recipient: meId }
      ]
    });

    if (existing) {
      if (existing.status === 'pending') {
        if (existing.requester.toString() === meId) {
          await existing.deleteOne();
          return res.json({
            status: 'none',
            message: 'Follow request cancelled'
          });
        }

        return res.status(400).json({
          status: 'incoming',
          message: 'This user already sent you a request. Accept it from requests panel.'
        });
      }

      if (existing.status === 'accepted') {
        return res.json({
          status: 'following',
          message: 'Already connected'
        });
      }

      if (existing.status === 'declined') {
        await existing.deleteOne();
      }
    }

    await Friendship.create({
      requester: meId,
      recipient: targetId,
      status: 'pending'
    });

    return res.status(201).json({
      status: 'requested',
      message: 'Follow request sent'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/follow/:userId/status  — follow relationship status for current user
router.get('/:userId/status', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.userId;
    const meId = req.user.userId;

    if (targetId === meId) {
      return res.json({ status: 'self' });
    }

    const me = await User.findById(meId).select('following');
    const following = me.following.map((id) => id.toString()).includes(targetId);
    if (following) {
      return res.json({ status: 'following' });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: meId, recipient: targetId },
        { requester: targetId, recipient: meId }
      ]
    });

    if (!existing || existing.status === 'declined') {
      return res.json({ status: 'none' });
    }

    if (existing.status === 'accepted') {
      return res.json({ status: 'following' });
    }

    if (existing.requester.toString() === meId) {
      return res.json({ status: 'requested' });
    }

    return res.json({ status: 'incoming' });
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
