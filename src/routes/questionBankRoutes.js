const express = require("express");
const router = express.Router();

const questionBankController = require("../controllers/questionBankController");

// POST CALL to upload questions
router.get("/get",questionBankController.getQuestionBank);
router.get("/get/:id",questionBankController.getQuestionBankByID);
router.delete("/softDelete/:id",questionBankController.softDeleteQuestionBank);
router.put("/edit/:id",questionBankController.editQuestionBank);
router.get("/get/module/:module_code",questionBankController.getQuestionBankByModuleCode);


module.exports = router;
