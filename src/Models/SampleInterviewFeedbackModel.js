const mongoose = require('mongoose');

const sampleInterviewFeedbackSchema = new mongoose.Schema({
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewModule",
        required: true
    },
    feedback: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        feedback: {
            type: String,
            required: false
        },
        helpfull:{
            type: Boolean,
            default: false
        },
        skip: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
    }]

}, { timestamps: true });


module.exports = mongoose.model("SampleInterviewFeedback", sampleInterviewFeedbackSchema);