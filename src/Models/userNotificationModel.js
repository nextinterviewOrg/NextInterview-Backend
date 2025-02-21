//userNotificationModel
const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    notification_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
        required: true,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    is_pushed: { // Flag to track if a notification is pushed to the user
        type: Boolean,
        default: false,
    },
    message: {
        type: String,
    },
});

userNotificationSchema.index({ user_id: 1, notification_id: 1 }, { unique: true });

module.exports = mongoose.model("UserNotification", userNotificationSchema);
