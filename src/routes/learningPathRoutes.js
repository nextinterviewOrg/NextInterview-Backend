const express = require("express");
const router = express.Router();

const learningPathController = require("../controllers/learningPathController");

// GET CALL to fetch data by ID
router.get("/:id", learningPathController.getLearningPathById);

module.exports = router;
