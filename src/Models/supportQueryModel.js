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
            date: { type: Date, default: Date.now },
            from: {
                type: mongoose.Schema.Types.Mixed,
                required: false // Change to false
            },
            to: {
                type: mongoose.Schema.Types.Mixed,
                required: false // Change to false
            },
            message: {
                type: String,
                required: true
            }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model("SupportQuery", supportQuerySchema);