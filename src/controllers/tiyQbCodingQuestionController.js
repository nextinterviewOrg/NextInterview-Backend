const TiyQbCodingQuestion = require("../Models/tiyQbCodingQuestionModel");
const mongoose = require("mongoose");
const TiyQbCodingQuestionProgress = require("../Models/tiyQbCodingQuestionProgressModel");
// Add a new question
exports.addQuestion = async (req, res) => {
    try {
        const newQuestion = new TiyQbCodingQuestion(req.body);
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all questions (excluding soft-deleted)
exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await TiyQbCodingQuestion.find({ isDeleted: false });
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get question by ID
exports.getQuestionById = async (req, res) => {
    try {
        const question = await TiyQbCodingQuestion.findById(req.params.id);
        if (!question || question.isDeleted) {
            return res.status(404).json({ message: "Question not found" });
        }
        res.status(200).json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Soft delete
exports.softDeleteQuestion = async (req, res) => {
    try {
        const question = await TiyQbCodingQuestion.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        res.status(200).json({ message: "Question soft-deleted", question });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Permanently delete
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await TiyQbCodingQuestion.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        res.status(200).json({ message: "Question permanently deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all TIY questions
exports.getAllTiyQuestions = async (req, res) => {
    try {
        const questions = await TiyQbCodingQuestion.find({ isTiyQuestion: true, isDeleted: false });
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all QB questions
exports.getAllQbQuestions = async (req, res) => {
    try {
        const questions = await TiyQbCodingQuestion.find({ isQbQuestion: true, isDeleted: false });
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const updatedQuestion = await TiyQbCodingQuestion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json({
            message: "Question updated successfully",
            data: updatedQuestion
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.getTIYQbQuestionfilters = async (req, res) => {
    try {
        // Get query parameters from the request
        const { module_code, topic_code, level, question_category } = req.query;

        // Create a filter object to build the query based on the optional parameters
        const filter = { isDeleted: false };

        if (module_code) {
            filter.module_code = module_code;
        }
        if (topic_code) {
            filter.topic_code = topic_code;
        }


        if (level) {
            filter.difficulty = level;
        }
        if (question_category) {
            if (question_category === 'tiy') {
                filter.isTiyQuestion = true;
            } else if (question_category === 'questionBank') {
                filter.isQbQuestion = true;
            }
        }
        filter.isDeleted = false;
        // Fetch the skill assessments using the dynamic filter
        const questions = await TiyQbCodingQuestion.find(filter);

        // Check if any skill assessments are found
        if (!questions.length) {
            return res.status(404).json({ success: false, message: 'No Questions found' });
        }

        // Return the found skill assessments
        return res.status(200).json({
            success: true,
            data: questions,
        });

    } catch (error) {
        // Handle errors (e.g., invalid query parameters)
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching Quetions ',
            error: error.message,
        });
    }
};

exports.getTIYQbQuestionfilterswithUserProgress = async (req, res) => {
    try {
        const { userId } = req.params;
        // Get query parameters from the request
        const { module_code, topic_code, level, question_category, } = req.query;

        // Create a filter object to build the query based on the optional parameters
        const filter = { isDeleted: false };

        if (module_code) {
            filter.module_code = module_code;
        }
        if (topic_code) {
            filter.topic_code = topic_code;
        }


        if (level) {
            filter.difficulty = level;
        }
        if (question_category) {
            if (question_category === 'tiy') {
                filter.isTiyQuestion = true;
            } else if (question_category === 'questionBank') {
                filter.isQbQuestion = true;
            }
        }
        filter.isDeleted = false;
        // Fetch the skill assessments using the dynamic filter
        const questions = await TiyQbCodingQuestion.find(filter);
        const questionIds = questions.map((question) => question._id);
        const userProgress = await TiyQbCodingQuestionProgress.find({
            questionId: { $in: questionIds },
            "progress.userId": userId,
        });
        const progressMap = new Map();
        userProgress.forEach(doc => {
            const userProg = doc.progress.find(p => p.userId.toString() === userId.toString());
            if (userProg) {
                progressMap.set(doc.questionId.toString(), {
                    status: userProg.skip ? "skipped" :
                        userProg.answer ? "attempted" : "viewed",
                    output: userProg.output,
                    answer: userProg.answer,
                    isCorrect: userProg.finalResult,
                    timestamp: userProg.timestamp
                });
            }
        });
        const questionsWithResults = questions.map(challenge => {
            const progress = progressMap.get(challenge._id.toString());

            return {
                questionId: challenge._id,
                programming_language: challenge.programming_language,
                questionText: challenge.QuestionText,
                description: challenge.description,
                difficulty: challenge.difficulty,
                userStatus: progress ? progress.status : "not attempted",
                isCorrect: progress ? progress.isCorrect : null,
                lastAttempted: progress ? progress.timestamp : null,
                hints: challenge.hints
            };
        });

        // Check if any skill assessments are found
        if (!questionsWithResults.length) {
            return res.status(404).json({ success: false, message: 'No Questions found' });
        }

        // Return the found skill assessments
        return res.status(200).json({
            success: true,
            data: questionsWithResults,
        });

    } catch (error) {
        // Handle errors (e.g., invalid query parameters)
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching Quetions ',
            error: error.message,
        });
    }
};

exports.getQuestionByIdWithUserResult=async (req, res) => {
    try {
        const { questionId, userId } = req.body;
        console.log("body", req.body);
        const progress = await TiyQbCodingQuestionProgress.findOne({
            questionId: questionId,
            "progress.userId": userId,
        });
        console.log("progress", progress);
        const userProgress = progress ? progress.progress.find(p => p.userId.toString() === userId.toString()) : null;
        const question = await TiyQbCodingQuestion.findById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        console.log("progress", userProgress);
        const result = {
           question,
           userProgress
        };
        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching question',
            error: error.message,
        });
    }
};

