require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const AppData = require('./models/AppData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';

async function fix() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ pin: '876548246587' });
    if (!adminUser) {
      console.log('Admin user not found!');
      return;
    }

    // Find all data
    const allData = await AppData.find({});
    console.log(`Found ${allData.length} AppData documents.`);
    
    // Sort by entries length descending to find the main one
    const sortedData = allData.sort((a, b) => (b.entries?.length || 0) - (a.entries?.length || 0));
    
    const mainData = sortedData[0];
    console.log(`Main data document has ${mainData.entries?.length || 0} entries, originally belonging to ${mainData.userId}`);

    // Delete any empty/stub document that belongs to the new admin user
    const emptyDocs = allData.filter(d => 
        d.userId.toString() === adminUser._id.toString() && 
        d._id.toString() !== mainData._id.toString()
    );
    
    for (const doc of emptyDocs) {
       await AppData.findByIdAndDelete(doc._id);
       console.log(`Deleted stub AppData ${doc._id}`);
    }

    // Now safely update the main document
    mainData.userId = adminUser._id;
    await mainData.save();

    console.log(`Successfully linked data to admin user (PIN: 876548246587)`);
    
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    mongoose.connection.close();
  }
}

fix();
