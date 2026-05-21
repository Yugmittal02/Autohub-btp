require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';

async function testSuspendAndActive() {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ role: 'user' });
    
    console.log('Suspending user...');
    await User.findByIdAndUpdate(user._id, { $set: { status: 'suspended' } }, { new: true, runValidators: true });
    console.log('Suspended successfully.');
    
    console.log('Activating user...');
    await User.findByIdAndUpdate(user._id, { $set: { status: 'active' } }, { new: true, runValidators: true });
    console.log('Activated successfully.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testSuspendAndActive();
