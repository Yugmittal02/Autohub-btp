const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-it-in-prod';

// Helper to generate 12 digit PIN
const generatePin = () => {
  let pin = '';
  for (let i = 0; i < 12; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  return pin;
};

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('verifyAdmin failed: User not found for ID', decoded.userId);
      return res.status(403).json({ error: 'Admin access required' });
    }
    if (user.role !== 'admin') {
      console.log('verifyAdmin failed: User role is', user.role, 'expected admin');
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Login with PIN
router.post('/login', async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ error: 'PIN required' });

    const user = await User.findOne({ pin });
    if (!user) return res.status(400).json({ error: 'Invalid PIN' });
    
    if (user.status === 'suspended') {
      return res.status(401).json({ error: 'Your account is temporarily suspended.' });
    }
    if (user.status === 'banned') {
      return res.status(401).json({ error: 'Your account is permanently banned.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, pin: user.pin, uid: user._id, role: user.role, name: user.name, status: user.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    if (user.status === 'suspended' || user.status === 'banned') {
      return res.status(401).json({ error: 'Account is no longer active' });
    }
    
    res.json({ pin: user.pin, uid: user._id, role: user.role });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// --- ADMIN ROUTES ---

// Get all users
router.get('/admin/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate new user PIN
router.post('/admin/generate', verifyAdmin, async (req, res) => {
  try {
    const { name, mobile } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and mobile number are required' });
    }

    let pin;
    let isUnique = false;
    // Ensure uniqueness
    while (!isUnique) {
      pin = generatePin();
      const existing = await User.findOne({ pin });
      if (!existing) isUnique = true;
    }

    const newUser = new User({ name, mobile, pin, role: 'user' });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user details & status
router.put('/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, mobile, status } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (status !== undefined) updateData.status = status;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (err) {
    console.error('Error updating user in backend:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
