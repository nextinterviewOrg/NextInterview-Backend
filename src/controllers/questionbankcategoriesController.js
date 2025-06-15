const QuestionBankCategory = require("../Models/questionBankCategoryModel");
const TiyQbCodingQuestion = require("../Models/tiyQbCodingQuestionModel");
const MainQuestionBank = require("../Models/mainQuestionBankModel");
const mongoose = require("mongoose");
exports.createQuestionBankCategory = async (req, res) => {
    try {
        const { category_name, numberOfQuestions } = req.body;
        const questionBankCategory = new QuestionBankCategory({ category_name, numberOfQuestions });
        await questionBankCategory.save();
        res.status(201).json({
            success: true,
            message: "QuestionBankCategory created successfully",
            data: questionBankCategory,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to create QuestionBankCategory",
            error: err.message,
        });
    }
};

exports.addQuestionsToCategory = async (req, res) => {
    try {
        const { category_id, question_ids } = req.body;
        let questionBankCategory = await QuestionBankCategory.findById(category_id);
        if (!questionBankCategory) {
            return res.status(404).json({
                success: false,
                message: "QuestionBankCategory not found",
            });
        }
        if (question_ids.length > (questionBankCategory.numberOfQuestions - questionBankCategory.questions.length)) {
            return res.status(200).json({
                success: false,
                message: `You can add only ${questionBankCategory.numberOfQuestions - questionBankCategory.questions.length} more questions`,
            });
        }
        await Promise.all(question_ids.map(async (question_id) => {
            if (!questionBankCategory.questions.includes(question_id)) {
                const question = await MainQuestionBank.findById(new mongoose.Types.ObjectId(question_id));

                if (question) {
                    // Add question to category
                    questionBankCategory.questions.push(question_id);

                    // Add category to question
                    if (!question.questionbankCategoryRef.includes(category_id)) {
                        question.questionbankCategoryRef.push(category_id);
                        await question.save();
                    }
                }
            }
        }));
        const questionBankCategoryCheckdata = await questionBankCategory.save();

        res.status(201).json({
            success: true,
            message: "QuestionBankCategory created successfully",
            data: questionBankCategoryCheckdata,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to create QuestionBankCategory",
            error: err.message,
        });
    }
}

exports.removeQuestionsFromCategory = async (req, res) => {
    try {
        const { category_id, question_ids } = req.body;
        console.log(category_id, question_ids);
        let questionBankCategory = await QuestionBankCategory.findById(category_id);
        if (!questionBankCategory) {
            return res.status(404).json({
                success: false,
                message: "QuestionBankCategory not found",
            });
        }
        await Promise.all(question_ids.map(async (question_id) => {
            if (questionBankCategory.questions.includes(question_id)) {
                const question = await MainQuestionBank.findById(question_id);
                if (question) {

                    questionBankCategory.questions = questionBankCategory.questions.filter((id) => !id.equals(question_id));
                    questionBankCategory = await questionBankCategory.save();
                    question.questionbankCategoryRef = question.questionbankCategoryRef.filter((id) => !id.equals(category_id));
                    await question.save();
                }

            }

        }));
        const questionBankCategoryCheckdata = await questionBankCategory.save();
        res.status(201).json({
            success: true,
            message: "QuestionBankCategory created successfully",
            data: questionBankCategoryCheckdata,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to create QuestionBankCategory",
            error: err.message,
        });
    }
}

exports.editQuestionBankCategory = async (req, res) => {
    try {
        const { category_id } = req.params;
        const { category_name, numberOfQuestions } = req.body;
        const questionBankCategoryData = await QuestionBankCategory.findById(category_id);
        if (!questionBankCategoryData) {
            return res.status(404).json({
                success: false,
                message: "QuestionBankCategory not found",
            });
        }
        if ( numberOfQuestions >(questionBankCategoryData.numberOfQuestions - questionBankCategoryData.questions.length) ) {
            return res.status(200).json({
                success: false,
                message: "please remove questions first to update number of questions",
            });
        }

        const questionBankCategory = await QuestionBankCategory.findByIdAndUpdate(category_id, req.body, { new: true });
        res.status(200).json({
            success: true,
            message: "QuestionBankCategory updated successfully",
            data: questionBankCategory,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to update QuestionBankCategory",
            error: err.message,
        });
    }
};
exports.getAllQuestionBankCategories = async (req, res) => {
    try {
        const questionBankCategories = await QuestionBankCategory.find()
            .populate("questions");
        res.status(200).json({
            success: true,
            message: "QuestionBankCategories fetched successfully",
            data: questionBankCategories,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch QuestionBankCategories",
            error: err.message,
        });
    }
};
exports.getCategoriesById = async (req, res) => {
    try {
        const { category_id } = req.params;
        const questionBankCategories = await QuestionBankCategory.findById(category_id)
            .populate("questions");

        res.status(200).json({
            success: true,
            message: "QuestionBankCategories fetched successfully",
            data: questionBankCategories,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch QuestionBankCategories",
            error: err.message,
        });
    }
};

exports.deleteQuestionBankCategory = async (req, res) => {
    try {
        const { category_id } = req.params;


        const questionBankCategories = await QuestionBankCategory.findById(category_id);
        if (!questionBankCategories) {
            return res.status(404).json({
                success: false,
                message: "QuestionBankCategory not found",
            });
        }
        await Promise.all(questionBankCategories.questions.map(async (question_id) => {
            const question = await MainQuestionBank.findById(question_id);
            if (question) {
                question.questionbankCategoryRef = question.questionbankCategoryRef.filter((id) => !id.equals(category_id));
                await question.save();
            }
        }))
        await QuestionBankCategory.findByIdAndDelete(category_id);
        res.status(200).json({
            success: true,
            message: "QuestionBankCategories deleted successfully",
            data: questionBankCategories,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to delete QuestionBankCategories",
            error: err.message,
        });
    }
}