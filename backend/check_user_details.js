require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';

async function checkUser() {
  await mongoose.connect(MONGO_URI);
  const user = await User.findById('6a0f2c51c13ef1a8e796ffaa');
  console.log('User:', user);
  process.exit(0);
}

checkUser();
