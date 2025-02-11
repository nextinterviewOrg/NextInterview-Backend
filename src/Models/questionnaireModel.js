const mongoose = require("mongoose");
const InterviewRound = require("./interviewRoundModel");

const questionnnaireSchema = new mongoose.Schema({
  data_job_response: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobResponse",
  },
  data_ai_job_response: {
    type: String,
  },
  data_experience_response: {
    type: String,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  data_scheduled_interview_response: {
    type: Boolean,
  },
  data_interview_schedule_response: {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyData",
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },
  },
  data_interview_scheduled_response: {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyData",
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },
    interviewRound: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewRound",
    },
    interviewDate: { type: Date },
  },
  data_planned_interview_response: {
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyData",
      }
    ],
    designations:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    }

  },
  data_past_interview_response: [
    {
      company_Name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyData",
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
      date_attended: {
        type: Date,
      },
    },
  ],
  data_motive_response: {
    type: String,
  },
}, { timestamps: true });


module.exports = mongoose.model("Questionnaire", questionnnaireSchema);
