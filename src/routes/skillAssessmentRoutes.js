const express = require("express");
const { getSkillAssessments, getSkillAssessmentById, softDeleteSkillAssessment, evaluateSkillAssessment,getSkillAssessmentByModuleCode } = require("../controllers/skillAssessmentController");
const router = express.Router();




router.get("/get", getSkillAssessments);
router.get("/get/:id", getSkillAssessmentById);
router.delete("/softDelete/:id", softDeleteSkillAssessment);
router.post("/evaluate",evaluateSkillAssessment);
router.get(("/get/module/:module_code"), getSkillAssessmentByModuleCode);

module.exports = router;    