const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/dbConfig");
require("dotenv").config();
const { Webhook } = require("svix");

const app = express();
app.use(express.json());
// app.use(cors());
const corsOptions = {
  origin: ['https://next-interview-git-develop-digi9.vercel.app', 'http://localhost:5173'], // Add more origins if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If your frontend needs to send cookies or authentication data
};

app.use(cors(corsOptions));
// app.use(cors({
//   origin: 'http://localhost:5173/', // Replace with your frontend URL
//   // methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow methods
//   // allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
// }));

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
const questionBankRoutes = require("./src/routes/questionBankRoutes");

const faqRoutes = require("./src/routes/faqRoutes");
const cornRoutes = require("./src/routes/cornRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");

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
app.use("/questionBank", questionBankRoutes);
app.use("/faq", faqRoutes);
app.use("/corn",cornRoutes);
app.use("/upload", uploadRoutes);
// app.listen(5000, () => {
//   console.log("Server started on port 5000");
// });
