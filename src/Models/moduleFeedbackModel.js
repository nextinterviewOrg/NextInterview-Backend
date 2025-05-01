const mongoose = require("mongoose");

const moduleFeedbackSchema = new mongoose.Schema({
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewModule",
        required: true
    },
    feedback_one:[
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            rating: {
                type: Number,
                required: false,
                min: 1,
                max: 5
            },
            feedback: {
                type: String,
                required: false
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            skip: {
                type: Boolean,
                default: false
            }
        }
    ],
    feedback_two:[
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            rating: {
                type: Number,
                required: false,
                min: 1,
                max: 5
            },
            feedback: {
                type: String,
                required: false
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            skip: {
                type: Boolean,
                default: false
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("ModuleFeedback", moduleFeedbackSchema);