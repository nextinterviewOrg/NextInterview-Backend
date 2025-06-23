const express = require("express");
const router = express.Router();
const userMainQuestionBankController = require("../controllers/userMainQuestionBankProgressController");

router.post("/",userMainQuestionBankController.createUserQuestionBankProgress);
router.post("/checkQuestionAnswered",userMainQuestionBankController.checkUserAnsweredQuestion);
router.post("/checkQuestionAnsweredbyId",userMainQuestionBankController.checkUserAnsweredQuestionbyId);
module.exports = router;