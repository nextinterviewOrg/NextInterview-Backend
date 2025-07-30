const mongoose = require("mongoose");

const newModuleSchema = new mongoose.Schema(
  {
    imageURL: String,
    moduleName: String,
    description: String,
    approxTimeTaken: String,
    interviewSampleURL: String,
    courseOverview: String,
    module_code: String,
    cheatSheetURL: String, // Moved from subtopic level to module level
    isDeleted: {
      type: Boolean,
      default: false,
    },
    userLearntData: [
      {
        learntData: String,
      },
    ],
    topicData: [
      {
        topicName: String,
        skillAssessmentQuestionsURL: String,
        topic_code: String,
        subtopicData: [
          {
            subtopic_code: String,
            subtopicName: String,
            subtopicContent: String,
            subtopicSummary: String,
            revisionPoints: String,
            // cheatSheetURL: String, // REMOVED from subtopic level
            interviewFavorite: Boolean,
            conceptClarifier: [
              {
                conceptClarifier: String,
                hoverExplanation: String,
                popupExplanation: String,
              },
            ],
            laymanTerms: [
              {
                topicLevel: String,
                topicTitle: String,
                topicInfo: String,
              },
            ],
            questionBankURL: String,
            tiyQuestionsURL: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("NewModule", newModuleSchema);
