const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'autohub_bills',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => `${Date.now()}-${Math.round(Math.random() * 1000)}`
  }
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-it-in-prod';

// Auth middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const upload = multer({ storage: storage });

// Upload Endpoint (protected)
router.post('/bill', requireAuth, upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    // req.file.path contains the secure URL provided by Cloudinary
    // req.file.filename contains the public_id in Cloudinary
    res.json({ 
      success: true, 
      imageUrl: req.file.path,
      path: req.file.filename 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Endpoint (protected)
router.delete('/bill', requireAuth, async (req, res) => {
  try {
    const { path } = req.body; // path is the Cloudinary public_id
    if (!path) return res.status(400).json({ error: 'No path provided' });
    
    // Optional: Only users who own the bill should be able to delete it,
    // but right now assuming logged-in user can delete their bills
    await cloudinary.uploader.destroy(path);
    res.json({ success: true, message: 'Image deleted from Cloudinary' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
