// Log uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const uploadRoutes = require('./routes/upload');

const app = express();
// Middleware
const corsOrigin = process.env.CORS_ORIGIN;
let allowedOrigins = true;
if (corsOrigin) {
  allowedOrigins = corsOrigin.split(',').map((origin) => origin.trim());
  allowedOrigins.push('https://autohub.krixov.com', 'https://krixov.com');
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint (for Render monitoring)
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'krixov-backend', uptime: process.uptime() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/upload', uploadRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krixov')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend server running. Started at: ${new Date().toISOString()} on port ${PORT}`);
});
