const mongoose = require("mongoose");
const { CompletionChoice } = require("svix");

const userChallengesProgressSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserChallenges",
        required: true
    },
    progress: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        choosen_option: {
            type: String,
            required: false
        },
        answer: {
            type: String,
            required: false
        },
        finalResult: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        skip: {
            type: Boolean,
            default: false
        }
    }],
});

module.exports = mongoose.model("UserChallengesProgress", userChallengesProgressSchema);
