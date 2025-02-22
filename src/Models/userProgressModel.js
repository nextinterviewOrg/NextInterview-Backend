const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    completedModules: [
      {
        moduleID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
        },
        moduleCode: String,  
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,  
      },
    ],
    completedTopics: [
      {
        moduleID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
        },
        moduleCode: String,
        topicID: {
            type: mongoose.Schema.Types.ObjectId,
        },
        topicCode: String, 
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,  
      },
    ],
    completedSubtopics: [
      {
        moduleID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
        },
        moduleCode: String, 
        topicID: {
            type: mongoose.Schema.Types.ObjectId,
        },
        topicCode: String,
        subtopicId:{
            type: mongoose.Schema.Types.ObjectId,
        },  
        subtopicCode: String,  
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,  
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProgress", userProgressSchema);
