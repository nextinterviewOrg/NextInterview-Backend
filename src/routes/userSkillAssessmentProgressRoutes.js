const  express= require("express");
const router = express.Router();
const userSkillAssessmentProgressController = require("../controllers/userSkillAssessmentProgressController");

router.post("/",userSkillAssessmentProgressController.addAssessmentProgress);

module.exports = router;