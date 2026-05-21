require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-it-in-prod';

async function testSuspend() {
  await mongoose.connect(MONGO_URI);
  
  // 1. Get the admin user
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log('No admin found');
    process.exit(1);
  }
  
  // 2. Generate token for admin
  const token = jwt.sign({ userId: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
  
  // 3. Find a regular user to suspend
  const userToSuspend = await User.findOne({ role: 'user' });
  if (!userToSuspend) {
    console.log('No normal user found to suspend');
    process.exit(1);
  }
  
  console.log('Trying to suspend user:', userToSuspend._id);
  
  // 4. Make fetch request just like frontend
  const url = `http://localhost:5000/api/auth/admin/users/${userToSuspend._id}`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userToSuspend.name,
        mobile: userToSuspend.mobile,
        status: 'suspended'
      })
    });
    
    console.log('Status:', res.status);
    const body = await res.text();
    console.log('Body:', body);
  } catch (err) {
    console.error('Fetch error:', err);
  }
  
  process.exit(0);
}
testSuspend();
