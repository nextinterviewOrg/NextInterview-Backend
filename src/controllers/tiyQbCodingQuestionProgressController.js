const TiyQbCodingQuestionProgress= require("../Models/tiyQbCodingQuestionProgressModel");
const mongoose = require("mongoose");
const TiyQbCodingQuestion = require("../Models/tiyQbCodingQuestionModel");


exports.addOrUpdateUserResponse = async (req, res) => {
    try {
        const { questionId, userId, answer, finalResult, output,skip } = req.body;

        if (!questionId || !userId) {
            return res.status(400).json({
                success: false,
                message: "questionId and userId are required"
            });
        }
        const question = await TiyQbCodingQuestion.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        let progressDoc = await TiyQbCodingQuestionProgress.findOne({ questionId });

        if (!progressDoc) {
            progressDoc = new TiyQbCodingQuestionProgress({
                questionId,
                progress: []
            });
        }

        const userProgressIndex = progressDoc.progress.findIndex(
            item => item.userId.toString() === userId.toString()
        );

        if (userProgressIndex === -1) {
    
            progressDoc.progress.push({
                userId,
                output: output || null,
                answer: answer || null,
                finalResult: finalResult || false,
                skip: skip || false
            });
        } else {
            // Update existing user progress
            if (answer !== undefined) {
                progressDoc.progress[userProgressIndex].answer = answer;
            }
            if (output !== undefined) {
                progressDoc.progress[userProgressIndex].output = output;
            }
            if (finalResult !== undefined) {
                progressDoc.progress[userProgressIndex].finalResult = finalResult;
            }
            if (skip !== undefined) {
                progressDoc.progress[userProgressIndex].skip = skip;
            }
            progressDoc.progress[userProgressIndex].timestamp = new Date();
        }

        // Save the document
        const savedProgress = await progressDoc.save();

        res.status(200).json({
            success: true,
            message: "User progress updated successfully",
            data: savedProgress
        });
    } catch (error) {
        console.error("Error updating user progress:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating user progress",
            error: error.message
        });
    }
};

// Check if user has answered a question
exports.checkUserResponse = async (req, res) => {
    try {
        const { questionId, userId } = req.body;

        // Validate required fields
        if (!questionId || !userId) {
            return res.status(400).json({
                success: false,
                message: "questionId and userId are required"
            });
        }

        // Find progress document
        const progressDoc = await TiyQbCodingQuestionProgress.findOne({
            questionId,
            "progress.userId": userId
        });

        if (!progressDoc) {
            return res.status(200).json({
                success: true,
                message: "User has not attempted this question",
                hasAnswered: false,
                data: null
            });
        }

        // Find the specific user's progress
        const userProgress = progressDoc.progress.find(
            item => item.userId.toString() === userId.toString()
        );

        res.status(200).json({
            success: true,
            message: "User progress retrieved successfully",
            hasAnswered: true,
            data: userProgress
        });
    } catch (error) {
        console.error("Error checking user progress:", error);
        res.status(500).json({
            success: false,
            message: "Server error while checking user progress",
            error: error.message
        });
    }
};