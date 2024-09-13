const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const dbURI = 'mongodb://localhost:27017/spotifydb'; // Use your MongoDB URI

// Database connection function
const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
  
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process if there is a failure
  }
};

module.exports = connectDB;
