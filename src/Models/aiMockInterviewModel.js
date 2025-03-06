const mongoose = require("mongoose");

const aiMockInterviewSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    thread_id: {
        type: String,
        required: true,
    },
    assistant_id: {
        type: String,
        required: true,
    },
    conversation: [{
        type:
        {
            id: {
                type: String,
            },
            created_at: { type: Date },
            role: { type: String },
            content: [
                {
                    type: {
                        type: String,
                    },
                    text: {
                        value: { type: String },

                    }
                }
            ],
        },
    }],

}, { timestamps: true });


module.exports = mongoose.model("AiMockInterview", aiMockInterviewSchema);