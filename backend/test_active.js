require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-it-in-prod';

async function testActive() {
  await mongoose.connect(MONGO_URI);
  
  const admin = await User.findOne({ role: 'admin' });
  const token = jwt.sign({ userId: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
  
  const userToSuspend = await User.findOne({ role: 'user' });
  
  console.log('Trying to activate user:', userToSuspend._id, 'with name:', userToSuspend.name);
  
  const url = `http://localhost:5000/api/auth/admin/users/${userToSuspend._id}`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userToSuspend.name, // maybe undefined?
        mobile: userToSuspend.mobile, // maybe undefined?
        status: 'active'
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
testActive();
