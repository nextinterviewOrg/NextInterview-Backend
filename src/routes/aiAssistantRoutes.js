const express = require("express");
const { getAiAssistants, getAiAssistantsByModuleId } = require("../controllers/aiAssistantController");
const router = express.Router();


router.get("/",getAiAssistants);
router.get("/getByModuleId/:moduleId",getAiAssistantsByModuleId);

module.exports = router;    