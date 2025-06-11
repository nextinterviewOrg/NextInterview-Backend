const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const csvParser = require("csv-parser")
const mainQuestionBankController = require("../controllers/mainQuestionBankController");
const { app } = require("firebase-admin");
const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, "uploads/");
  // },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/uploadFile", upload.single('file'), mainQuestionBankController.uploadQuestions);
router.get("/get", mainQuestionBankController.getAllQuestions);
router.get("/get/tiyQuestions", mainQuestionBankController.getALLTIYQuestions);
router.get("/get/QBQuestions", mainQuestionBankController.getAllQUestionBankQuestions);
router.get("/get/questionByfilter", mainQuestionBankController.getQuestions);
router.get("/get/questionByID/:id", mainQuestionBankController.getQuestionByID);
router.delete("/softDelete/:id", mainQuestionBankController.softDeleteQuestion);
router.put("/edit/:id", mainQuestionBankController.editQuestion);
router.get("/get/module/:module_code/:userId", mainQuestionBankController.getQuestionsByModuleCode);
router.post("/addcodingquestion", mainQuestionBankController.addCodingQuestion);
router.put("/updatecodingquestion/:id", mainQuestionBankController.updateCodingQuestion);
router.get('/questions-with-attempts/:userId', mainQuestionBankController.getAllQuestionsWithAttemptStatus);
router.get('/get/AllCodingQuestions', mainQuestionBankController.getAllCodingQuestions);
router.get("/get/questionByfilter/userResponse/:userId", mainQuestionBankController.getQuestions);
router.get("/get/qbQuestionBycategory/:category/:userId", mainQuestionBankController.getAllQBQuestionByCAtegryId);
router.get("/get/questionsToAdd/byCategory/:categoryId", mainQuestionBankController.getQuestionToAddCategory);
router.get("/get/tiyQuestions/withUserResponse/:userId", mainQuestionBankController.getALLTIYQuestionsWithUserResponse);
router.get("/get/QBQuestions/withUserResponse/:userId", mainQuestionBankController.getAllQBQuestionByCAtegryIdWithUserResponse);
router.post("/tryHarderQuestion", mainQuestionBankController.getNextLevelQuestion);
module.exports = router;