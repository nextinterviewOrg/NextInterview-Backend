const mongoose = require("mongoose");

const newModuleSchema = new mongoose.Schema(
  {
    imageURL: String,
    moduleName: String,
    description: String,
    approxTimeTaken: String,
    interviewSampleURL: String,
    courseOverview: String,
    userLearntData: [
      {
        learntData: String,
      },
    ],
    topicData: [
      {
        topicName: String,
        skillAssessmentQuestionsURL: String,
        subtopicData: [
          {
            subtopicName: String,
            subtopicContent: String,
            subtopicSummary: String,
            revisionPoints: String,
            cheatSheetURL: String,
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
