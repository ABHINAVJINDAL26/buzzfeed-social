const express      = require('express');
const router       = express.Router();
const Friendship   = require('../models/Friendship');
const User         = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/friends/request/:userId  — send friend request
router.post('/request/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.userId)
      return res.status(400).json({ message: "Can't send request to yourself" });

    const existing = await Friendship.findOne({
      $or: [
        { requester: req.user.userId, recipient: userId },
        { requester: userId,      recipient: req.user.userId }
      ]
    });
    if (existing) return res.status(400).json({ message: 'Request already exists' });

    const friendship = await Friendship.create({
      requester: req.user.userId,
      recipient: userId
    });

    res.status(201).json({ message: 'Friend request sent', friendship });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/friends/accept/:friendshipId  — accept request
router.put('/accept/:friendshipId', authMiddleware, async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);
    if (!friendship) return res.status(404).json({ message: 'Request not found' });
    if (friendship.recipient.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });

    friendship.status = 'accepted';
    await friendship.save();

    // Add each other as followers
    await User.findByIdAndUpdate(friendship.requester, {
      $addToSet: { following: friendship.recipient }
    });
    await User.findByIdAndUpdate(friendship.recipient, {
      $addToSet: { followers: friendship.requester }
    });

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/friends/decline/:friendshipId  — decline request
router.put('/decline/:friendshipId', authMiddleware, async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);
    if (!friendship) return res.status(404).json({ message: 'Not found' });

    friendship.status = 'declined';
    await friendship.save();
    res.json({ message: 'Request declined' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/friends/pending  — get pending requests for logged-in user
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const requests = await Friendship.find({
      recipient: req.user.userId,
      status: 'pending'
    }).populate('requester', 'username avatar');

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/friends/list  — get all accepted friends
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const friends = await Friendship.find({
      $or: [{ requester: req.user.userId }, { recipient: req.user.userId }],
      status: 'accepted'
    }).populate('requester recipient', 'username avatar isOnline lastSeen');

    const list = friends.map(f =>
      f.requester._id.toString() === req.user.userId ? f.recipient : f.requester
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
