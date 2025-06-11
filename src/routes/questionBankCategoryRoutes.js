const express = require("express");
const router = express.Router();
const questionBankCategoryController = require("../controllers/questionbankcategoriesController");

// GET CALL to fetch data by ID
router.get("/:category_id", questionBankCategoryController.getCategoriesById);
router.get("/", questionBankCategoryController.getAllQuestionBankCategories);
router.post("/", questionBankCategoryController.createQuestionBankCategory);
router.put("/:category_id", questionBankCategoryController.editQuestionBankCategory);
router.post("/addQuestionToCategory", questionBankCategoryController.addQuestionsToCategory);
router.post("/removeQuestionFromCategory", questionBankCategoryController.removeQuestionsFromCategory);
module.exports = router;