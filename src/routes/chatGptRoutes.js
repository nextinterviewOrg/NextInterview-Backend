const express = require("express");
const router = express.Router();

const chatGptController = require("../controllers/chatGptController");

router.post("/", chatGptController.getChatGPTResponse);
router.post("/optimesecode", chatGptController.getOptimeseCodeResponse);

module.exports = router;
