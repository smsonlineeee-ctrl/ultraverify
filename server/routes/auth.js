const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_please_change_in_production';

// User Signup
router.post('/signup', async (req, res) => {
  try {
    const { displayName, email, phone, password, referral } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      displayName,
      email,
      phone,
      password: hashedPassword,
      referral
    });

    await user.save();

    // Create token
    const payload = { user: { id: user.id, role: user.role, displayName: user.displayName } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: user.id, displayName: user.displayName, email: user.email, result: 'signup success' } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// User & Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, isAdminLogin } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    // Role check if logging into admin panel
    if (isAdminLogin && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Requires admin privileges' });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id, role: user.role, displayName: user.displayName } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });

    res.json({ token, user: { id: user.id, displayName: user.displayName, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
