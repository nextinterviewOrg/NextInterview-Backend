const mongoose = require("mongoose");
const { CompletionChoice } = require("svix");

const userDashboardSchema = new mongoose.Schema(
  {
    modulesCompleted: Number,
    modulesOngoing: Number,
    remainingModules: Number,
    progressRate: Number,
    challenges: [
      {
        totalChallenges: Number,
        completedChallenges: Number,
      },
    ],
    selfGrowthTrend: [
      {
        totalQuestionsCompleted: Number,
        successfullyCompleted: Number,
        successRate: Number,
        yourStrength: String,
        yourWeakness: String,
      },
    ],
    totalMockTests: [
      {
        month: String,
        testCount: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserDashboard", userDashboardSchema);
