const mongoose = require("mongoose");

const SkillAssessSchema = new mongoose.Schema({
  module_code: String,
  topic_code: String,
  subtopic_code: String,
  question_type: {
    type: String,
    required: true,
    enum: ['mcq', 'single-line', 'multi-line', 'approach', ],  // Enum for unit
    message: 'question type must be one of the following: mcq, single-line, multi-line, approach'
  },
  level:{
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard',],  // Enum for unit
    message: 'level must be one of the following: easy, medium, hard'
  },
  question: String,
  answer: String,
  option_a: String,
  option_b: String,
  option_c: String,
  option_d: String,
  correct_option: String,
  isDeleted: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("SkillAssessment", SkillAssessSchema);