const express = require("express");
const {
    createAiAssistant,
    getAiAssistants,
    getAiAssistantsById,
    modifyAiAssistant,
    deleteAiAssistant,
    createThread,
    createAndRunThread,
    createMessage,
    runThread,
    checkStatus,
    textToSpeech,
    speechToText,
    endInterviewandStoreInteractions
} = require("../controllers/aiMockInterviewController");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, path.extname(file.originalname));
  },
});

const upload = multer({ storage });


router.post("/createMockInterviewAssistant", createAiAssistant);
router.get("/getMockInterviewAssistants", getAiAssistants);
router.get("/getMockInterviewAssistants/:id", getAiAssistantsById);
router.put("/updateMockInterviewAssistants/:id", modifyAiAssistant);
router.delete("/deleteMockInterviewAssistants/:id", deleteAiAssistant);
router.post("/createThread", createThread);
router.post("/createThreadandRun", createAndRunThread);
router.post("/createMessage",createMessage);
router.post("/runThread", runThread);
router.post("/checkThreadStatus", checkStatus);
router.post("/textToSpeech/", textToSpeech);
router.post("/speechToText",upload.single("speechFile"), speechToText);
router.post("/EndInterview",endInterviewandStoreInteractions)

module.exports = router;