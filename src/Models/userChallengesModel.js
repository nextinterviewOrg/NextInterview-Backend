const mongoose = require("mongoose");

const userChallengesSchema = new mongoose.Schema({
    programming_language: {
        type: String,
        enum: ["MySQL", "Python"],
        required: true
    },
    QuestionText: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true

    },
    hints: [{
        hint_text: {
            type: String,
            required: true
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

}, { timestamps: true });

module.exports = mongoose.model("UserChallenges", userChallengesSchema);