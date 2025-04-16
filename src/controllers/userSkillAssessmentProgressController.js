const UserSkillAssessmentProgress = require("../Models/userSkillAssessmentProgressModel");

/**
 * Add or update a User's skill-assessment progress
 */
exports.addAssessmentProgress = async (req, res) => {
    try {
        const {
            userId,
            moduleId,
            moduleCode,
            topicCode,
            subtopicCode,
            questionId,
            selectedOption,
            finalResult,
        } = req.body;
        let userProgress = await UserSkillAssessmentProgress.findOne({ userId });
        if (!userProgress) {
            userProgress = new UserSkillAssessmentProgress({
                userId,
                progress: [],
            });
        }

        let moduleObj = userProgress.progress.find(
            (mod) => mod.moduleID?.toString() === moduleId
        );

        if (!moduleObj) {
            moduleObj = {
                moduleID: moduleId,
                moduleCode: moduleCode,
                totalQuestionsAnswered: 0,
                finalScore: 0,
                progressTopics: [],
            };
            userProgress.progress.push(moduleObj);
            moduleObj = userProgress.progress.find(
                (mod) => mod.moduleID?.toString() === moduleId
            );
        }

        let topicObj = moduleObj.progressTopics.find(
            (top) => top.topicCode?.toString() === topicCode
        );
        if (!topicObj) {
            topicObj = {
                topicCode: topicCode,
                totalQuestions: 0,
                finalScore: 0,
                progressSubtopics: [],
            };
            moduleObj.progressTopics.push(topicObj);
            topicObj = moduleObj.progressTopics.find(
                (top) => top.topicCode?.toString() === topicCode
            );
        }

        let subtopicObj = topicObj.progressSubtopics.find(
            (sub) => sub.subtopicCode?.toString() === subtopicCode
        );
        if (!subtopicObj) {
            subtopicObj = {
                subtopicCode,
                totalQuestions: 0,
                finalScore: 0,
                questions: [],
            };
            topicObj.progressSubtopics.push(subtopicObj);
            subtopicObj = topicObj.progressSubtopics.find(
                (sub) => sub.subtopicCode?.toString() === subtopicCode
            );
        }

        let questionObj = subtopicObj.questions.find(
            (q) => q.questionId?.toString() === questionId
        );
        if (!questionObj) {
            
            subtopicObj.questions.push({
                questionId,
                selectedOption,
                finalResult,
            });
        } else {
            questionObj.selectedOption = selectedOption;
            questionObj.finalResult = finalResult;
        }

        subtopicObj.totalQuestions = subtopicObj.questions.length;
        subtopicObj.finalScore = subtopicObj.questions.filter((q) => q.finalResult)
            .length;
        const totalSubtopicQuestions = topicObj.progressSubtopics.reduce(
            (acc, st) => acc + st.totalQuestions,
            0
        );
        const totalSubtopicScore = topicObj.progressSubtopics.reduce(
            (acc, st) => acc + st.finalScore,
            0
        );
        topicObj.totalQuestions = totalSubtopicQuestions;
        topicObj.finalScore = totalSubtopicScore;

        const totalTopicQuestions = moduleObj.progressTopics.reduce(
            (acc, t) => acc + t.totalQuestions,
            0
        );
        const totalTopicScore = moduleObj.progressTopics.reduce(
            (acc, t) => acc + t.finalScore,
            0
        );
        moduleObj.totalQuestionsAnswered = totalTopicQuestions;
        moduleObj.finalScore = totalTopicScore;

        await userProgress.save();

        return res.status(200).json({
            success: true,
            message: "Progress updated successfully.",
            data: userProgress,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};
