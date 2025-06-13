const Razorpay = require("razorpay");
const SubscriptionPlan = require("../Models/SubscriptionPlan");
const User = require("../Models/user-Model");
const mongoose = require("mongoose");

// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// POST /api/plans/create
exports.createPlan = async (req, res) => {
  try {
    const { name, description, interval, amount } = req.body;

    const plan = await razorpayInstance.plans.create({
      period: interval,
      interval: 1,
      item: {
        name,
        description,
        amount: amount * 100, // Razorpay uses paise
        currency: "INR",
      }
    });

    const savedPlan = new SubscriptionPlan({
      name,
      description,
      razorpay_plan_id: plan.id,
      interval,
      amount,
      currency: "INR"
    });

    await savedPlan.save();
    res.status(201).json({ success: true, plan: savedPlan });

  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ success: false, message: "Plan creation failed" });
  }
};

// PATCH /api/plans/:id/toggle
exports.togglePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findById(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    plan.isActive = !plan.isActive;
    await plan.save();

    res.json({ success: true, status: plan.isActive ? "activated" : "deactivated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Toggle failed" });
  }
};

// GET /api/plans
exports.getAllPlans = async (req, res) => {
  const onlyActive = req.query.active === "true";

  const plans = await SubscriptionPlan.find(
    onlyActive ? { isActive: true } : {}
  );

  res.json({ success: true, plans });
};

exports.createSubscription = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ message: "Invalid or inactive plan" });
    }

    const subscription = await razorpayInstance.subscriptions.create({
      plan_id: plan.razorpay_plan_id,
      customer_notify: 1,
      total_count: 12, // For example, valid for 12 billing cycles
    });

    // Save details to user profile
    user.subscription = {
      razorpay_subscription_id: subscription.id,
      plan: plan._id,
      start_date: new Date(subscription.start_at * 1000),
      status: subscription.status,
    };
    await user.save();

    res.json({
      success: true,
      message: "Subscription created",
      subscriptionId: subscription.id,
      subscription,
    });

  } catch (error) {
    console.error("Subscription creation failed:", error);
    res.status(500).json({ success: false, message: "Failed to create subscription" });
  }
};

exports.getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("subscription.plan");

    if (!user || !user.subscription?.razorpay_subscription_id) {
      return res.status(404).json({ message: "No active subscription" });
    }

    const subscription = await razorpayInstance.subscriptions.fetch(
      user.subscription.razorpay_subscription_id
    );

    res.json({
      success: true,
      subscription,
      plan: user.subscription.plan,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch subscription" });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    const subId = user?.subscription?.razorpay_subscription_id;

    if (!subId) return res.status(400).json({ message: "No active subscription" });

    const cancel = await razorpayInstance.subscriptions.cancel(subId);

    user.subscription.status = "cancelled";
    await user.save();

    res.json({ success: true, message: "Subscription cancelled", cancel });
  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel subscription" });
  }
};


exports.razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const receivedSignature = req.headers["x-razorpay-signature"];
  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (receivedSignature !== generatedSignature) {
    console.warn("⚠️ Signature mismatch!");
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body.event;
  const payload = req.body.payload?.subscription?.entity;
  const razorpaySubscriptionId = payload?.id;

  if (!razorpaySubscriptionId) {
    return res.status(400).json({ message: "Missing subscription ID in payload" });
  }

  try {
    const user = await User.findOne({ "subscription.razorpay_subscription_id": razorpaySubscriptionId });

    if (!user) {
      return res.status(404).json({ message: "User not found for this subscription" });
    }

    switch (event) {
      case "subscription.activated":
      case "subscription.completed":
      case "subscription.halted":
      case "subscription.cancelled":
        user.subscription.status = payload.status;
        await user.save();
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }

    res.status(200).json({ message: `Webhook handled for event: ${event}` });

  } catch (error) {
    console.error("🔴 Error handling webhook:", error);
    res.status(500).json({ message: "Webhook processing error" });
  }
};
