const express = require("express");
const app = express();
const router = express.Router();
const reminderController = require("../controllers/reminderController");

// GET CALL to fetch data by ID
router.post("/sendReminder", reminderController.sendRemainder);

module.exports = router;