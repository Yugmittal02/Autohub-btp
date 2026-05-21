require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';

async function check() {
  await mongoose.connect(MONGO_URI);
  const admin = await User.findOne({ pin: '876548246587' });
  console.log('Admin:', admin);
  process.exit(0);
}
check();
