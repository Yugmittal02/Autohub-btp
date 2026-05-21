require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yugmittal689_db_user:luHPzIwUWaulBLVU@cluster0.inhe4un.mongodb.net/?appName=Cluster0';

async function fixIndex() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const collection = mongoose.connection.collection('users');
    
    // Drop the old email index
    try {
      await collection.dropIndex('email_1');
      console.log('Successfully dropped old email index');
    } catch (e) {
      console.log('Index email_1 not found or already dropped:', e.message);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

fixIndex();
