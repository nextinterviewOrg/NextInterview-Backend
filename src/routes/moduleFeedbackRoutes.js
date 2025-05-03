const express = require("express");
const router = express.Router();
const moduleFeedbackController = require("../controllers/moduleFeedbackController");

router.post("/", moduleFeedbackController.addModuleFeedback);
router.get("/get/:moduleId", moduleFeedbackController.getModuleFeedback);
router.get("/getAll", moduleFeedbackController.getAllModuleFeedback);
router.post("/checkfeedback/exists", moduleFeedbackController.getUserFeedbackCheck);  
router.get("/getmodulefeedback/:moduleId", moduleFeedbackController.getFeedbackModuleId);
router.get("/getAllModulefeedbackstats", moduleFeedbackController.getAllModuleFeedbacksRatings);

module.exports = router;