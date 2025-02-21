//notificationModel
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    
    headingText: {
        type: String,
        required: true,
    },

    subText: {
        type: String,
        required: true,
    },

    Trigger:{
        type: String,
        required: true,
    },

    timeZone: {
        type: String,
        required: false,
    },

    time: {
        type: String,
        required: true,
    },

    frequency: {
        type: String,
        required: false,
    },
    notificationType: {
        type: String,
        required: true,
    },
    created_on: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Notification", notificationSchema);