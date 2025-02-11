const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, unique: true, required: true },
  created_at: {
    type: Date,
    default: Date.now,
  },
  user_name: {
    type: String,
    required: true,
  },
  user_email: {
    type: String,
  },
  user_phone_number: {
    type: String,
  },
  user_role: {
    type: String,
    default: "user",
  },
  user_profile_pic: {
    type: String,
  },
  user_linkedin_profile_link: {
    type: String,
  },
  user_data_questionnaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Questionnaire",
  },
  profile_status: {
    type: Boolean,
    default: false,
  },
  user_Restriction_Data: {
    restrictionStatus: {
      type: Boolean,
      default: false
    },
    restrictionStart: {
      type: Date,
    },
    restrictionEnd: {
      type: Date,
    },
    reason: {
      type: String,
    },
    remarks: {
      type: String,
    }
  }

}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);
