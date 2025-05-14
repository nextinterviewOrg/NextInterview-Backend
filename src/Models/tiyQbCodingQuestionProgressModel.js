const mongoose = require("mongoose");

const tiyQbCodingQuestionProgressSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TiyQbCodingQuestion",
        required: true
    },
    progress: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        output: {
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
    }]
});

module.exports = mongoose.model("TiyQbCodingQuestionProgress", tiyQbCodingQuestionProgressSchema);
