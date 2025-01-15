// routes/questionnaireRoutes.js

const express = require("express");
const router = express.Router();
const {
  createQuestionnaire,
  getAllQuestionnaires,
  getQuestionnaireById,
  getQuestionnairesByUserId,
  updateQuestionnaire,
  deleteQuestionnaire,
} = require("../controllers/questionnaireController");

// @route   POST /api/questionnaires
// @desc    Create a new Questionnaire
// @access  Public (Adjust access as needed)
router.post("/", createQuestionnaire);

// @route   GET /api/questionnaires
// @desc    Get all Questionnaires
// @access  Public (Adjust access as needed)
router.get("/", getAllQuestionnaires);

// @route   GET /api/questionnaires/:id
// @desc    Get a Questionnaire by ID
// @access  Public (Adjust access as needed)
router.get("/:id", getQuestionnaireById);

// @route   GET /api/questionnaires/user/:userId
// @desc    Get Questionnaires by User ID
// @access  Public (Adjust access as needed)
router.get("/user/:userId", getQuestionnairesByUserId);

// @route   PUT /api/questionnaires/:id
// @desc    Update a Questionnaire by ID
// @access  Public (Adjust access as needed)
router.put("/:id", updateQuestionnaire);

// @route   DELETE /api/questionnaires/:id
// @desc    Delete a Questionnaire by ID
// @access  Public (Adjust access as needed)
router.delete("/:id", deleteQuestionnaire);

module.exports = router;
