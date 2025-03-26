const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    blog_title: {
        type: String,
        required: true,
    },
    blog_description: {
        type: String,
        required: true,
    },
    blog_image: {
        type: String,
        required: true,
    },

}, { timestamps: true });

module.exports = mongoose.model("Blog", blogSchema);