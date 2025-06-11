const mongoose = require("mongoose");

const userChallengesSchema = new mongoose.Schema({
    programming_language: {
        type: String,
        enum: ["MySQL", "Python"],
        required: false
    },
    QuestionText: {
        type: String,
        required: false
    },
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
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
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
    question_type: {
        type: String,
        enum: ["mcq", "single-line", "multi-line", "approach", "coding", "case-study"],
        message: 'question type must be one of the following: mcq, single-line, multi-line, approach'
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    base_code: {
        type: String,
        required: false
    },
    option_a: {
        type: String,
        required: false
    },
    option_b: {
        type: String,
        required: false
    },
    option_c: {
        type: String,
        required: false
    },
    option_d: {
        type: String,
        required: false
    },
    correct_option: {
        type: String,
        required: false
    },
    answer: {
        type: String,
        required: false
    },
    challenge_date: {
        type: Date,
        default: Date.now
    },
    dbSetupCommands: {
        type: String,
        required: false
    },
    solutionCode: {
        type: String,
        required: false
    },
    solutionExplanation: {
        type: String,
        required: false
    },

}, { timestamps: true });

module.exports = mongoose.model("UserChallenges", userChallengesSchema);