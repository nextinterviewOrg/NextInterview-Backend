const mongoose = require("mongoose");

const questionBankCategorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
    },
    numberOfQuestions: {
        type: Number,
        required: true,
    },
    questions:[ {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref:"MainQuestionBank"
    }]
}, { timestamps: true });


module.exports = mongoose.model("QuestionBankCategory", questionBankCategorySchema);