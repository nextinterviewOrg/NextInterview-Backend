const express = require("express");
const router = express.Router();
const userChallengesController = require("../controllers/userChallengesController");

// Create a new challenge
router.post("/", userChallengesController.createChallenge);

// Get all challenges
router.get("/", userChallengesController.getAllChallenges);

// Get a single challenge by ID
router.get("/:id", userChallengesController.getChallengeById);

// Update a challenge
router.put("/:id", userChallengesController.updateChallenge);

// Delete a challenge
router.delete("/:id", userChallengesController.deleteChallenge);
router.get("/today/:userId", userChallengesController.getTodaysChallengesWithStatus);
router.get("/all-with-results/:userId", userChallengesController.getAllChallengesWithUserResults);
module.exports = router;