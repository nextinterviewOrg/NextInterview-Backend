const mongoose = require("mongoose");


const MainQuestionBankSchema = new mongoose.Schema({
    module_code: String,
    topic_code: String,
    subtopic_code: String,
    question_type: {
        type: String,
        required: true,
        enum: ['mcq', 'single-line', 'multi-line', 'approach', 'coding'],  // Enum for unit
        message: 'question type must be one of the following: mcq, single-line, multi-line, approach'
    },
    programming_language: {
        type: String,
        enum: ["MySQL", "Python"],
        required: false
    },
    level: {
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
    description: {
        type: String,
        required: false
    },
    input: {
        type: String,
        required: false
    },
    output: {
        type: String,
        required: false
    },
    hints: [{
        hint_text: {
            type: String,
            required: false
        },
        explanation: {
            type: String,
            required: false
        }
    }],
    uploaded_date: {
        type: Date,
        default: Date.now
    },
    topics: [
        {
            topic_name: {
                type: String,
                required: false
            }
        }
    ],
    base_code: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isTIYQustion: {
        type: Boolean,
        default: false,
    },
    isQuestionBank: {
        type: Boolean,
        default: false,
    },
    questionbankCategoryRef: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "QuestionBankCategory",
            required: false
        }
    ],
    dbSetupCommands: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model("MainQuestionBank", MainQuestionBankSchema);