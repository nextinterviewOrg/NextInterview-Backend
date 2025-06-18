const mongoose = require("mongoose");

const interview_topicSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: false,
    },
    description : {
        type: String,
        required: false
    },
    difficulty : {
        type: String,
        required: false
    },
    tags :[ {
        type: String,
        required: false
    }]
}, { timestamps: true });


module.exports = mongoose.model("Interview_topics", interview_topicSchema);