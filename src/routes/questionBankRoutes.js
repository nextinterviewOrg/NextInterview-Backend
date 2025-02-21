const express = require("express");
const router = express.Router();

const questionBankController = require("../controllers/questionBankController");

// POST CALL to upload questions
router.get("/get",questionBankController.getQuestionBank);
router.get("/get/:id",questionBankController.getQuestionBankByID);
router.delete("/softDelete/:id",questionBankController.softDeleteQuestionBank);


module.exports = router;
