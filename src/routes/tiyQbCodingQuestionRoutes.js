const express = require("express");
const router = express.Router();
const controller = require("../controllers/tiyQbCodingQuestionController");

router.post("/", controller.addQuestion);
router.get("/", controller.getAllQuestions);
router.get("/get/tiy", controller.getAllTiyQuestions);
router.get("/get/qb", controller.getAllQbQuestions);
router.get("/:id", controller.getQuestionById);
router.delete("/soft-delete/:id", controller.softDeleteQuestion);
router.delete("/:id", controller.deleteQuestion);
router.put("/:id", controller.updateQuestion);
router.get("/get/questionFilter/", controller.getTIYQbQuestionfilters);
router.get("/get/questionFilterResult/:userId", controller.getTIYQbQuestionfilterswithUserProgress);
router.post("/questionWithResponse", controller.getQuestionByIdWithUserResult);
module.exports = router;
