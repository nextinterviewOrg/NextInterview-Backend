const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
    sno: String,
    topic_name: String,
    level: String,
    type: String,
    reference: String,
    question: String,
    answer: String,
    mcq_question: String,
    option_1: String,
    option_2: String,
    option_3: String,
    option_4: String,
    time_duration: String,
  }
);

module.exports = mongoose.model("Challenges", challengeSchema);