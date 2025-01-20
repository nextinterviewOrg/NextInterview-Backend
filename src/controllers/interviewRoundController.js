// src/controllers/interviewRoundController.js
const InterviewRound = require('../Models/interviewRoundModel');

// Create an Interview Round
exports.createInterviewRound = async (req, res) => {
  try {
    const { roundName } = req.body;

    const newRound = new InterviewRound({
      roundName,
    });

    await newRound.save();
    res.status(201).json({ message: 'Interview round created successfully', newRound });
  } catch (error) {
    console.error('Error creating interview round:', error);
    res.status(500).json({ message: 'Error creating interview round' });
  }
};

// Get All Interview Rounds
exports.getAllInterviewRounds = async (req, res) => {
  try {
    const rounds = await InterviewRound.find();
    res.status(200).json(rounds);
  } catch (error) {
    console.error('Error getting interview rounds:', error);
    res.status(500).json({ message: 'Error getting interview rounds' });
  }
};

// Get Interview Round by ID
exports.getInterviewRoundById = async (req, res) => {
  try {
    const round = await InterviewRound.findById(req.params.id);
    if (!round) {
      return res.status(404).json({ message: 'Interview round not found' });
    }
    res.status(200).json(round);
  } catch (error) {
    console.error('Error getting interview round by ID:', error);
    res.status(500).json({ message: 'Error getting interview round' });
  }
};

// Update Interview Round
exports.updateInterviewRound = async (req, res) => {
  try {
    const { roundName } = req.body;
    const round = await InterviewRound.findByIdAndUpdate(
      req.params.id,
      { roundName },
      { new: true, runValidators: true }
    );

    if (!round) {
      return res.status(404).json({ message: 'Interview round not found' });
    }

    res.status(200).json({ message: 'Interview round updated successfully', round });
  } catch (error) {
    console.error('Error updating interview round:', error);
    res.status(500).json({ message: 'Error updating interview round' });
  }
};

// Delete Interview Round
exports.deleteInterviewRound = async (req, res) => {
  try {
    const round = await InterviewRound.findByIdAndDelete(req.params.id);

    if (!round) {
      return res.status(404).json({ message: 'Interview round not found' });
    }

    res.status(200).json({ message: 'Interview round deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview round:', error);
    res.status(500).json({ message: 'Error deleting interview round' });
  }
};
