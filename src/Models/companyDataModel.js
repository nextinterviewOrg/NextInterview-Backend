const mongoose = require("mongoose");

const companyDataSchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
  },
  company_description: {
    type: String,
    required: true,
    default: "",
  },
  company_website: {
    type: String,
    required: true,
  },
  company_logo: {
    type: String,
    required: true,
  },
}, { timestamps: true });


module.exports = mongoose.model("CompanyData", companyDataSchema);
