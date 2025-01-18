// src/routes/interviewRoundRoutes.js
const express = require('express');
const router = express.Router();
const interviewRoundController = require('../controllers/interviewRoundController');

// Create Interview Round
router.post('/', interviewRoundController.createInterviewRound);

// Get All Interview Rounds
router.get('/', interviewRoundController.getAllInterviewRounds);

// Get Interview Round by ID
router.get('/:id', interviewRoundController.getInterviewRoundById);

// Update Interview Round
router.put('/:id', interviewRoundController.updateInterviewRound);

// Delete Interview Round
router.delete('/:id', interviewRoundController.deleteInterviewRound);

module.exports = router;
