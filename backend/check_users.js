require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';

async function checkUsers() {
  await mongoose.connect(MONGO_URI);
  const users = await User.find({});
  console.log('All Users:');
  users.forEach(u => {
    console.log(`ID: ${u._id}, PIN: ${u.pin}, Role: ${u.role}, Status: ${u.status}`);
  });
  process.exit(0);
}
checkUsers();
