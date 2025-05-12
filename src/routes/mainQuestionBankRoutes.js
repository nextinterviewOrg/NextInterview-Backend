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
router.get("/get/module/:module_code", mainQuestionBankController.getQuestionsByModuleCode);


module.exports = router;