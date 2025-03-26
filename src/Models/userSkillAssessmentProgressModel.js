const mongoose = require("mongoose");

const userSkillAssessmentProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        progress: [
            {
                moduleID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "NewModule",
                },
                totalQuestionsAnswered: Number,
                finalScore: Number,
                moduleCode: String,
                progressTopics: [
                    {
                        topicCode: String,
                        totalQuestions: Number,
                        finalScore: Number,
                        progressSubtopics: [
                            {
                                subtopicCode: String,
                                totalQuestions: Number,
                                finalScore: Number,
                                questions: [
                                    {
                                        questionId: {
                                            type: mongoose.Schema.Types.ObjectId,
                                            ref:"SkillAssessment"
                                        },
                                        selectedOption: String,
                                        finalResult: Boolean,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
      
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserSkillAssessmentProgress", userSkillAssessmentProgressSchema);
