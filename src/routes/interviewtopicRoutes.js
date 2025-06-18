const express = require("express");
const router = express.Router();
const interviewTopicController = require("../controllers/interview_topicsController");

// GET CALL to fetch data by ID
router.get("/getTopics",interviewTopicController.getAllTopics);

module.exports = router;