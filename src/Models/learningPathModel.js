const mongoose = require("mongoose");

const learningPathSchema = new mongoose.Schema({
  moduleName: String,
  topicsComplete: Number,
  totalTopics: Number,
  topicStatus: Number,
  topics: [
    {
      topicTitle: String,
      subtopicTitle: String,
      subtopicDuration: Number,
      subtopicStatus: Boolean,
    },
  ],
});
