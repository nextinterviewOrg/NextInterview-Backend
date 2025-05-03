const mongoose = require("mongoose");

const userQuestionBankProgressSchema = new mongoose.Schema({

    moduleId: {
        type: String,
        required: true
    },
    progress: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        answered_Questions: [{
            questionBankId: {
                type: String,
                required: true
            },
            answer: {
                type: String,
                required: false
            },
            question_type: {
                type: String,
                required: true,
                enum: ['mcq', 'single-line', 'multi-line', 'approach',],  // Enum for unit
                message: 'question type must be one of the following: mcq, single-line, multi-line, approach'
            },
            choosen_option: {
                type: String,
                required: false
            }
        }]


    }]

}, { timestamps: true });

module.exports = mongoose.model("UserQuestionBankProgress", userQuestionBankProgressSchema);