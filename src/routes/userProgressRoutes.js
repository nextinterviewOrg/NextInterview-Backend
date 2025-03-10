const express = require("express");
const { startModule, startTopic, startSubtopic, completeTopic, completeModule, completeSubtopic, getUserProgress, getProgressStats, getUserProgressByModuleCode, getUserProgressBySubtopicCode, getUserProgressByTopicCode } = require("../controllers/userProgressController");


const router = express.Router();




router.post("/startModule",startModule);
router.post("/startTopic",startTopic);
router.post("/startSubTopic",startSubtopic);
router.post("/completeModule",completeModule);
router.post("/completeTopic",completeTopic);
router.post("/completeSubTopic",completeSubtopic);
router.get("/getProgress/:userId",getUserProgress);
router.get("/getProgressStats/:userId",getProgressStats);
router.post("/getprogressByUserModule",getUserProgressByModuleCode);
router.post("/getprogressByUserTopic",getUserProgressByTopicCode);
router.post("/getprogressByUserSubtopic",getUserProgressBySubtopicCode);
module.exports = router;