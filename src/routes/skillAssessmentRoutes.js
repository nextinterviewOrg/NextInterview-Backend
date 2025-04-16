const express = require("express");
const { getSkillAssessments, getSkillAssessmentById, softDeleteSkillAssessment, evaluateSkillAssessment } = require("../controllers/skillAssessmentController");
const router = express.Router();




router.get("/get", getSkillAssessments);
router.get("/get/:id", getSkillAssessmentById);
router.delete("/softDelete/:id", softDeleteSkillAssessment);
router.post("/evaluate",evaluateSkillAssessment);

module.exports = router;    