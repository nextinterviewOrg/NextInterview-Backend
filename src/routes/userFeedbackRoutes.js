const express = require("express");
const router = express.Router();
const userFeedbackController = require("../controllers/userFeedbackController");

// Create new feedback
router.post("/", userFeedbackController.createFeedback);

// Get all feedback for a module
router.get("/module/:moduleId", userFeedbackController.getModuleFeedback);

// Get all feedback for a user
router.get("/user/:userId", userFeedbackController.getUserFeedback);

// Get feedback statistics for a module
router.get("/module/:moduleId/stats", userFeedbackController.getModuleFeedbackStats);

// Delete feedback (admin only)
router.delete("/:feedbackId", userFeedbackController.deleteFeedback);

module.exports = router; 