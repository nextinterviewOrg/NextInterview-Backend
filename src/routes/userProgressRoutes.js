const express = require("express");
const {
    startModule,
    startTopic,
    startSubtopic,
    completeTopic,
    completeModule,
    completeSubtopic,
    getUserProgress,
    getProgressStats,
    getUserProgressByModuleCode,
    getUserProgressBySubtopicCode,
    getUserProgressByTopicCode,
    getUserCompletedModules,
    checkSubtopicCompletion,
    checkAllTopicsCompletion
} = require("../controllers/userProgressController");


const router = express.Router();




router.post("/startModule", startModule);
router.post("/startTopic", startTopic);
router.post("/startSubTopic", startSubtopic);
router.post("/completeModule", completeModule);
router.post("/completeTopic", completeTopic);
router.post("/completeSubTopic", completeSubtopic);
router.get("/getProgress/:userId", getUserProgress);
router.get("/getProgressStats/:userId", getProgressStats);
router.post("/getprogressByUserModule", getUserProgressByModuleCode);
router.post("/getprogressByUserTopic", getUserProgressByTopicCode);
router.post("/getprogressByUserSubtopic", getUserProgressBySubtopicCode);
router.get("/get/moduleCompleted/:userId", getUserCompletedModules);
router.get("/progress/:userId/subtopics/:moduleCode/:topicCode", checkSubtopicCompletion);
router.get("/progress/:userId/topics/:moduleCode", checkAllTopicsCompletion);
module.exports = router;