const fs = require("fs");
const path = require("path");
const multer = require("multer");
const csvParser = require("csv-parser")
const SkillAssessmentModel = require("../Models/skillAssessmentModel");
const QuestionBankModel = require("../Models/questionBankModel");
const TIYModel = require("../Models//TIYSchemaModel");
const mongoose = require("mongoose");
const {
  processChallengesCSV,
  processQuestionBankCSV,
  processSkillAssessmentCSV,
  processTIYCSV,
} = require("../utils/utils");
const express = require("express");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });



// Challenges Schema
const ChallengesSchema = new mongoose.Schema({
  sno: String,
  topic_name: String,
  level: String,
  type: String,
  reference: String,
  question: String,
  answer: String,
  mcq_question: String,
  option_1: String,
  option_2: String,
  option_3: String,
  option_4: String,
  time_duration: String,
});

const ChallengesModel = mongoose.model("Challenges", ChallengesSchema);




router.post("/upload-csv-challenges", upload.single("csv"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  processChallengesCSV(req.file.path, ChallengesModel)
    .then(() => {
      res.status(200).send("CSV file processed and data stored in MongoDB.");
    })
    .catch((err) => {
      console.error("Error processing CSV:", err);
      res.status(500).send("Error processing CSV file.");
    });
});

router.post("/upload-csv-tiy", upload.single("csv"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  processTIYCSV(req.file.path, TIYModel, req.body.module_code, req.body.topic_code, req.body.subtopic_code)
    .then(() => {
      res.status(200).send("CSV file processed and data stored in MongoDB.");
    })
    .catch((err) => {
      console.error("Error processing CSV:", err);
      res.status(500).send("Error processing CSV file.");
    });
});

router.post("/upload-csv-skillassessment", upload.single("csv"), (req, res) => {
  console.log("req.file", req.body.mc);
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  processSkillAssessmentCSV(req.file.path, SkillAssessmentModel, req.body.module_code, req.body.topic_code, req.body.subtopic_code)
    .then(() => {
      res.status(200).send("CSV file processed and data stored in MongoDB - skillAssesment.");
    })
    .catch((err) => {
      console.error("Error processing CSV:", err);
      res.status(500).send("Error processing CSV file.");
    });
});

router.post("/upload-csv-questionbank", upload.single("csv"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  processQuestionBankCSV(req.file.path, QuestionBankModel, req.body.module_code, req.body.topic_code, req.body.subtopic_code)
    .then(() => {
      res.status(200).send("CSV file processed and data stored in MongoDB.");
    })
    .catch((err) => {
      console.error("Error processing CSV:", err);
      res.status(500).send("Error processing CSV file.");
    });
});

router.get("/fetchChallenges", (req, res) => {
  ChallengesModel.find()
    .then((challenges) => {
      res.status(200).json({
        success: true,
        data: challenges,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch data",
        error: err.message,
      });
    });
});

router.get("/fetchTIY", (req, res) => {
  TIYModel.find()
    .then((tiy) => {
      res.status(200).json({
        success: true,
        data: tiy,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch data",
        error: err.message,
      });
    });
});

router.get("/fetchSkillAssessment", (req, res) => {
  SkillAssessmentModel.find()
    .then((skillAssessment) => {
      res.status(200).json({
        success: true,
        data: skillAssessment,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch data",
        error: err.message,
      });
    });
});

router.get("/fetchQuestionBank", (req, res) => {
  QuestionBankModel.find()
    .then((questionBank) => {
      res.status(200).json({
        success: true,
        data: questionBank,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch data",
        error: err.message,
      });
    });
});

module.exports = router;