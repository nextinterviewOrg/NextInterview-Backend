const express = require("express");
const router = express.Router();

const chatGptController = require("../controllers/chatGptController");

router.get("/", chatGptController.getChatGPTResponse);

module.exports = router;
