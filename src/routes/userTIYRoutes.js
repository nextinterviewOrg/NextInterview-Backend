const express= require("express");
const router = express.Router();
const userTIYController = require("../controllers/userProgressTIYController");

router.post("/",userTIYController.createUserTIYProgress);
router.post("/checkQuestionAnswered",userTIYController.checkUserAnsweredQuestion);
module.exports = router;