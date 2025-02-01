const mongoose = require("mongoose");
require("dotenv").config();


const MONGODB_URI =process.env.MONGODB_URL //development
const MONGODB_URI_PROD = process.env.MONGODB_URL_PROD;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI_PROD, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // Uncomment if using older versions of Mongoose
      // useFindAndModify: false, // Uncomment if using older versions of Mongoose
      
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;