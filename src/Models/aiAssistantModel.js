const mongoose = require("mongoose");

const aiAssistantSchema = new mongoose.Schema({
    moduleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewModule",
        required: true
    },
    id: {
        type: String,
        required: true
    },
    object: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    model: {
        type: String,
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    tools: [
        {
            type: {
                type: String,
            }
        }
    ],
    metadata: {
        type: Object
    },
    top_p: {
        type: Number
    },
    temperature: {
        type: Number
    },
    response_format: {
        type: String
    },
    deleted: {
        type: Boolean,
        default: false
    }
}
    , { timestamps: true });


module.exports = mongoose.model("AiAssistant", aiAssistantSchema);