const mongoose = require("mongoose");
const jobResponseSchema = new mongoose.Schema({
  response_name: {
    type: String,
    required: true,
  },
}, { timestamps: true });


module.exports = mongoose.model("JobResponse", jobResponseSchema);
