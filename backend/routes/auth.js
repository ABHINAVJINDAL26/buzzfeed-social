const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const createToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      username: user.username,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const usernameExists = await User.findOne({ username: username.trim() });
    if (usernameExists) {
      return res.status(409).json({ message: 'Username already in use' });
    }

    const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (emailExists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    });

    user.points = 50;
    user.pointsHistory.push({ action: 'signup_bonus', points: 50 });
    await user.save();

    const token = createToken(user);

    return res.status(201).json({
      token,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: 'Signup failed: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginValue = String(identifier || email || '').trim().toLowerCase();

    if (!loginValue || !password) {
      console.log("Login Attempt Failed: Missing identifier or password", req.body);
      return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { email: loginValue },
        { username: new RegExp(`^${loginValue}$`, 'i') }
      ]
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
