require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';

async function testStatusUpdate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const normalUser = await User.findOne({ role: 'user' });
    if (!normalUser) {
      console.log('No normal user found');
      process.exit(1);
    }
    console.log('Found user:', normalUser._id, 'Status:', normalUser.status);

    console.log('Updating to active using findByIdAndUpdate with runValidators: true...');
    const updated = await User.findByIdAndUpdate(
      normalUser._id,
      { $set: { status: 'active' } },
      { new: true, runValidators: true }
    );
    console.log('Update successful. New status:', updated.status);
    
  } catch (error) {
    console.error('Update failed with error:', error.message);
    if (error.errors) {
      console.error(error.errors);
    }
  } finally {
    process.exit(0);
  }
}

testStatusUpdate();
