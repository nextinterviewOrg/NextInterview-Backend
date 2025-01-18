// src/models/InterviewRound.js
const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  roundName: {
    type: String,
    required: true,  // Ensure this field is required
    trim: true,      // Trim whitespace
  },
}, { timestamps: true });

const InterviewRound = mongoose.model('InterviewRound', interviewRoundSchema);

module.exports = InterviewRound;
