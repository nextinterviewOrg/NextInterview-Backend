const express = require("express");
const router = express.Router();
const tiyQbController =require("../controllers/tiyQbCodingQuestionProgressController");

router.post("/",tiyQbController.addOrUpdateUserResponse);
router.post("/checkQuestionAnswered",tiyQbController.checkUserResponse);
module.exports = router;