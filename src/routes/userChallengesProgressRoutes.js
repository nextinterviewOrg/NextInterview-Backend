const express = require("express");
const router = express.Router();
const progressController = require("../controllers/userChallengesProgressController");


router.post("/response", progressController.addOrUpdateUserResponse);


router.get("/check-response/:questionId/:userId", progressController.checkUserResponse);

module.exports = router;