const mongoose = require("mongoose");

const questionBankSchema = new mongoose.Schema({
  questionSet: [
    {
      topicName: String,
      level: Number,
      type: Number,
      reference: String,
      question: String,
      answer: String,
      status: Boolean,
    },
  ],
});
