const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/dbConfig");
require("dotenv").config();

const app = express();



connectDB()
  .then(() => {
    console.log("Connected to MongoDB");


    // Start the Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  });