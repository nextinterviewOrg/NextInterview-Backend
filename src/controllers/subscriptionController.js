const Razorpay = require("razorpay");
const SubscriptionPlan = require("../Models/SubscriptionPlan");
const User = require("../Models/user-Model");
const mongoose = require("mongoose");
const crypto = require("crypto");
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/plans/create
exports.createPlan = async (req, res) => {
  try {
    const { name, description, interval, amount,features } = req.body;

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
      currency: "INR",
      features
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

    const plan = await SubscriptionPlan.findOne({razorpay_plan_id:planId});
    if (!plan || !plan.isActive) {
      console.log(plan);
      return res.status(400).json({ message: "Invalid or inactive plan" });
    }

    const subscription = await razorpayInstance.subscriptions.create({
      plan_id: plan.razorpay_plan_id,
      customer_notify: 1,
      total_count: 12, // For example, valid for 12 billing cycles
    });

    // Save details to user profile
    // user.subscription_renewal_history.push( {
    //   subscription_id: subscription.id,
    //   start_date: new Date(subscription.start_at * 1000),
    //   end_date: new Date(subscription.end_at * 1000),
    //   renewed_at: new Date(),
    //   status: subscription.status,
    // });
    user.razorpay_plan_id = plan.razorpay_plan_id;
    user.razorpay_subscription_id = subscription.id;
    user.subscription_status = subscription.status;
    user.subscription_start=new Date(subscription.start_at * 1000),
    user.subscription_end=new Date(subscription.end_at * 1000),
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
    const user = await User.findById(userId);
  

    if (!user || !user?.razorpay_subscription_id) {
      return res.status(200).json({success:false, message: "No active subscription" });
    }

    const subscription = await razorpayInstance.subscriptions.fetch(
      user?.razorpay_subscription_id
    );
    let plan;
    if(user.subscription_status==="active"){
      plan = await SubscriptionPlan.findOne({razorpay_plan_id:user.razorpay_plan_id});
    }

    res.json({
      success: true,
      subscription,
      status: user.subscription_status,
      plan: plan,
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
  console.log("razorpay webhook called");
  const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(body)
    .digest("hex");
console.log("signature", signature, "expectedSignature", expectedSignature,"\n ",(signature == expectedSignature));
  if (signature !== expectedSignature) {
    return res.status(200).send("Invalid signature");
  }
  
console.dir(req.body,{depth:null});
  const event = req.body.event;
  const subscription = req.body.payload.subscription?.entity;

  if (!subscription || !subscription.id) {
    return res.status(400).send("Missing subscription data");
  }

  try {
    const user = await User.findOne({ razorpay_subscription_id: subscription.id });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Handle events
    if (event === "subscription.activated" || event === "subscription.completed") {
      const start = new Date(subscription.current_start * 1000);
      const end = new Date(subscription.current_end * 1000);
      user.razorpay_subscription_id = subscription.id;
      user.razorpay_plan_id = subscription.plan_id;
      user.subscription_status = "active";
      user.subscription_start = start;
      user.subscription_end = end;

      // Add to renewal history
      user.subscription_renewal_history.push({
        subscription_id: subscription.id,
        start_date: start,
        end_date: end,
        status: "active",
        renewed_at: new Date(),
      });
      console.log("usrer", user);

      await user.save();
      return res.status(200).send("Subscription activated/renewed");
    }

    if (event === "subscription.cancelled" || event === "subscription.halted") {
      user.subscription_status = event === "subscription.cancelled" ? "cancelled" : "halted";
      user.subscription_end = new Date(subscription.current_end * 1000);

      await user.save();
      return res.status(200).send("Subscription cancelled or halted");
    }

    res.status(200).send("Unhandled event processed");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Server error");
  }
};
