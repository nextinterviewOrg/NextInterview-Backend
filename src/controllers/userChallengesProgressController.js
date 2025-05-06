const UserChallengesProgress = require("../Models/userChallengesProgresModel");

// Add or update user response
exports.addOrUpdateUserResponse = async (req, res) => {
    try {
        const { questionId, userId, answer, finalResult, skip } = req.body;

        if (!questionId || !userId) {
            return res.status(400).json({
                success: false,
                message: "questionId and userId are required"
            });
        }

        let progressDoc = await UserChallengesProgress.findOne({ questionId });

        if (!progressDoc) {
            progressDoc = new UserChallengesProgress({
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
                answer: answer || "",
                finalResult: finalResult || false,
                skip: skip || false
            });
        } else {
            // Update existing user progress
            if (answer !== undefined) {
                progressDoc.progress[userProgressIndex].answer = answer;
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
        const { questionId, userId } = req.params;

        // Validate required fields
        if (!questionId || !userId) {
            return res.status(400).json({
                success: false,
                message: "questionId and userId are required"
            });
        }

        // Find progress document
        const progressDoc = await UserChallengesProgress.findOne({
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