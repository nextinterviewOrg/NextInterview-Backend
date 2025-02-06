const express = require("express");
const router = express.Router();

const questionBankController = require("../controllers/questionBankController");

// POST CALL to upload questions
router.post("/", questionBankController.createQuestionBank);
// GET CALL to fetch all questions
router.get("/", questionBankController.getQuestions);
// GET CALL to fetch questions by category ID
router.get("/:id", questionBankController.getQuestionsByID);

module.exports = router;
