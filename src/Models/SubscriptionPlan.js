const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },                  // e.g., Basic, Pro, Enterprise
  description: { type: String },
  razorpay_plan_id: { type: String, required: true },      // From Razorpay response
  interval: { type: String, enum: ["monthly", "yearly"], required: true },
  amount: { type: Number, required: true },
  features: [{ type: String, required: false }],               // In rupees (e.g. 199)
  currency: { type: String, default: "INR" },
  isActive: { type: Boolean, default: true },              // Activate/Deactivate toggle
  created_by: { type: String },                            // Optional: admin ID/email
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
