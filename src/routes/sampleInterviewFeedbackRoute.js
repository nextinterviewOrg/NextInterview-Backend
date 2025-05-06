const express = require("express"); 
const router= express.Router();
const sampleInterviewFeedbackController = require("../controllers/sampleInterviewFeedbackController");

router.post("/", sampleInterviewFeedbackController.createFeedback);
router.get("/get", sampleInterviewFeedbackController.getAllFeedbacks);
router.get("/get/:moduleId", sampleInterviewFeedbackController.getFeedbackByModuleId);
router.post("/checkfeedback/exists", sampleInterviewFeedbackController.checkUserFeedbackStatus);

module.exports = router;