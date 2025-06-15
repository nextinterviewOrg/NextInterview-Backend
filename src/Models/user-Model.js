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
  },
  // subscription
  razorpay_customer_id: { type: String },         // Razorpay customer ID
  razorpay_subscription_id: { type: String },     // Active subscription ID
  razorpay_plan_id: { type: String },             // Which plan is subscribed
  subscription_status: {                          // e.g., active, cancelled, expired
    type: String,
    enum: ["active", "cancelled", "expired", "halted", "created","not_subscribed"],
    default: "not_subscribed",
  },
  subscription_start: { type: Date },
  subscription_end: { type: Date },
  subscription_renewal_history: [                 // Optional history log
    {
      subscription_id: String,
      start_date: Date,
      end_date: Date,
      status: String, // active, cancelled, etc.
      renewed_at: Date,
    }
  ],

}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);
