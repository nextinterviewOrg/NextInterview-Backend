const mongoose = require("mongoose");
const { Schema } = mongoose;

const reminderSchema = new Schema({
    heading : {
        type : String,
        required : true
        },

        subText : {
            type : String,
            required : true
        },

        notificationType : {
            type : String,
            required : true
        },

        user_id : {
            type : [Schema.Types.ObjectId],
            required : true
        },
    },{timestamps : true});
    module.exports = mongoose.model("Reminder", reminderSchema);
