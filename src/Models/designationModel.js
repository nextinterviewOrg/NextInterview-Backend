const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema({
  designation_name: {
    type: String,
    required: true,
  },
}, { timestamps: true });


module.exports = mongoose.model("Designation", designationSchema);
