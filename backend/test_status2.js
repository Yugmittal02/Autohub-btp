require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';

async function testStatusUpdate() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const normalUser = await User.findOne({ role: 'user' });
    
    console.log('Updating to active with empty name...');
    const updated = await User.findByIdAndUpdate(
      normalUser._id,
      { $set: { status: 'active', name: '', mobile: '' } },
      { new: true, runValidators: true }
    );
    console.log('Update successful.', updated.status);
    
  } catch (error) {
    console.error('Update failed with error:', error.message);
  } finally {
    process.exit(0);
  }
}

testStatusUpdate();
