const mongoose = require("mongoose");

/**
 * @desc Establishes a connection to MongoDB Atlas using the MONGO_URI environment variable.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB URI
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Unable to connect to MongoDB: ${error.message}`);
    
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

// Export only the Mongoose connection function
module.exports = { connectDB };
