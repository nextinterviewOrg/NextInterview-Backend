const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/dbConfig");
require("dotenv").config();
const { Webhook } = require("svix");

const app = express();
app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: 'https://next-interview-git-develop-digi9.vercel.app', // Replace with your frontend URL
  // methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow methods
  // allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");

    // Start the Server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  });

const userRoutes = require("./src/routes/userRoutes");
const jobResponseRoutes = require("./src/routes/jobResponseRoutes");
const designationRoutes = require("./src/routes/designationRoutes");
const companyDataRoutes = require("./src/routes/companyDataRoutes");
const questionnaireRoutes = require("./src/routes/questionnaireRoutes");
const topicRoutes = require("./src/routes/topicRoutes");
const interviewRoutes= require("./src/routes/interviewRoundRoutes");
const addNewModuleRoutes = require("./src/routes/addNewModuleRoutes");
// Flash Card Routes
const aiFlashCardRoutes = require("./src/routes/aiFlashCardRoutes");
// User Dashboard Routes
const userDashboardRoutes = require("./src/routes/userDashboardRoutes");
// Learning Path Routes
const learningPathRoutes = require("./src/routes/learningPathRoutes");


app.use("/users", userRoutes);
app.use("/jobResponse", jobResponseRoutes);
app.use("/designation", designationRoutes);
app.use("/companyData", companyDataRoutes);
app.use("/questionnaire", questionnaireRoutes);
app.use("/topic", topicRoutes); 
app.use("/interviewRound", interviewRoutes);
app.use("/addNewModule", addNewModuleRoutes);
// Flash Cards URI
app.use("/flashCards", aiFlashCardRoutes);
// User Dashboard URI
app.use("/userDashboard", userDashboardRoutes);
// Learning Path URI
app.use("/pathProgress", learningPathRoutes);

// app.listen(5000, () => {
//   console.log("Server started on port 5000");
// });
