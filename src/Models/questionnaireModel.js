const mongoose = require("mongoose");

const questionnnaireSchema = new mongoose.Schema({
  data_job_response: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobResponse",
  },
  data_experience_response: {
    type: String,
  },
  data_scheduled_interview_response: {
    type: Boolean,
  },
  data_interview_schedule_response: {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },
  },
  data_interview_scheduled_response: {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },
  },
  data_past_interview_response: {
    company_Name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },
    what_went_well: {
      type: String,
    },
    what_went_bad: {
      type: String,
    },
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
  },
  data_motive_response: {
    type: String,
  },
});

module.exports = mongoose.model("Questionnaire", questionnnaireSchema);
