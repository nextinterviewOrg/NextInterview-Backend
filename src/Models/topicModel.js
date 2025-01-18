const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  topic_name: {
    type: String,
    required: true,
  },
  topic_description: {
    type: String,
    required: true,
  },
}, { timestamps: true });



module.exports = mongoose.model("Topic", topicSchema);
