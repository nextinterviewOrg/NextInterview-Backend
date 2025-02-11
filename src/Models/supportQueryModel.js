const mongoose = require("mongoose");

const supportQuerySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
    },
    query_description: {
        type: String,
        required: true,
    },
    submitted_on: {
        type: Date,
        default: Date.now,
    },
    closed_on: {  
        type: Date,
        default: null,
    },
    communicationLog: [
        {
            date: { type: Date, default: Date.now }, // The date the log entry was created
            message: String,
            
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model("SupportQuery", supportQuerySchema);
