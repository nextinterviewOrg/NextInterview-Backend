const express = require("express");
const router = express.Router();
const moduleFeedbackController = require("../controllers/moduleFeedbackController");

router.post("/", moduleFeedbackController.addModuleFeedback);
router.get("/get/:moduleId", moduleFeedbackController.getModuleFeedback);
router.get("/getAll", moduleFeedbackController.getAllModuleFeedback);
router.post("/checkfeedback/exists", moduleFeedbackController.getUserFeedbackCheck);  

module.exports = router;