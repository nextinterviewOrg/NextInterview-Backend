const express= require("express");
const router = express.Router();
const userQuestionBankProgressController = require("../controllers/userQuestionBankProgressController");

router.post("/",userQuestionBankProgressController.createUserQuestionBankProgress);
router.post("/checkQuestionAnswered",userQuestionBankProgressController.checkUserAnsweredQuestion);
module.exports = router;