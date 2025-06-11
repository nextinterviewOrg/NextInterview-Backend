const mongoose = require("mongoose");


const tiyQbCodingQuestionSchema = new mongoose.Schema({
    module_code: {
        type: String,
        required: false
    },
    topic_code: {
        type: String,
        required: false
    },
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
    isDeleted: {
        type: Boolean,
        default: false,
    },
    base_code: {
        type: String,
        required: false
    },
    isTiyQuestion: {
        type: Boolean,
        default: false
    },
    isQbQuestion: {
        type: Boolean,
        default: false
    },
    questionbankCategoryRef:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "QuestionBankCategory",
            required: false
        }
    ]
}, { timestamps: true });


module.exports = mongoose.model("TiyQbCodingQuestion", tiyQbCodingQuestionSchema);