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
const requireActiveSubscription = require("../middleware/requireActiveSubscription");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, path.extname(file.originalname));
  },
});

const upload = multer({ storage });


router.post("/createMockInterviewAssistant", requireActiveSubscription, createAiAssistant);
router.get("/getMockInterviewAssistants", requireActiveSubscription, getAiAssistants);
router.get("/getMockInterviewAssistants/:id", requireActiveSubscription, getAiAssistantsById);
router.put("/updateMockInterviewAssistants/:id", requireActiveSubscription, modifyAiAssistant);
router.delete("/deleteMockInterviewAssistants/:id", requireActiveSubscription, deleteAiAssistant);
router.post("/createThread", requireActiveSubscription, createThread);
router.post("/createThreadandRun", requireActiveSubscription, createAndRunThread);
router.post("/createMessage", requireActiveSubscription, createMessage);
router.post("/runThread", requireActiveSubscription, runThread);
router.post("/checkThreadStatus", requireActiveSubscription, checkStatus);
router.post("/textToSpeech/", requireActiveSubscription, textToSpeech);
router.post("/speechToText", requireActiveSubscription, upload.single("speechFile"), speechToText);
router.post("/EndInterview", requireActiveSubscription, endInterviewandStoreInteractions)

module.exports = router;