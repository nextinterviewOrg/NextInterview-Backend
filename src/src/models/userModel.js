const mongoose = require("mongoose");
 
 
const userSchema = new mongoose.Schema({
    clerkUserId: { type: String, unique: true, required: true },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
 
    },
    phone: {
        type: String,
 
    },
    role: {
        type: String,
 
    }
});
 
module.exports = mongoose.model("user", userSchema);