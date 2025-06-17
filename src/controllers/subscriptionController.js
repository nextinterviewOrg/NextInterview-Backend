const Razorpay = require("razorpay");
const SubscriptionPlan = require("../Models/SubscriptionPlan");
const User = require("../Models/user-Model");
const mongoose = require("mongoose");
const crypto = require("crypto");
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const moment = require("moment-timezone");
// POST /api/plans/create
exports.createPlan = async (req, res) => {
  try {
    const { name, description, interval, amount, features } = req.body;

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
  try {
    const plans = await SubscriptionPlan.find(
      { isActive: true }
    );

    res.json({ success: true, plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ success: false, message: "Server error while fetching plans" });
  }

};

exports.createSubscription = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const plan = await SubscriptionPlan.findOne({ razorpay_plan_id: planId });
    if (!plan || !plan.isActive) {
      console.log(plan);
      return res.status(400).json({ message: "Invalid or inactive plan" });
    }
    if (user.subscription_status === "active") {
      const cancel = await razorpayInstance.subscriptions.cancel(user?.razorpay_subscription_id);
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
    user.subscription_start = new Date(subscription.start_at * 1000),
      user.subscription_end = new Date(subscription.end_at * 1000),
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
      return res.status(200).json({ success: false, message: "No active subscription" });
    }

    const subscription = await razorpayInstance.subscriptions.fetch(
      user?.razorpay_subscription_id
    );
    let plan;
    if (user.subscription_status === "active") {
      plan = await SubscriptionPlan.findOne({ razorpay_plan_id: user.razorpay_plan_id });
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
    if (user.subscription_status !== "active") {
      return res.status(400).json({ message: "No active subscription" });
    }
    const subId = user?.razorpay_subscription_id;

    if (!subId) return res.status(400).json({ message: "No active subscription" });

    const cancel = await razorpayInstance.subscriptions.cancel(subId);

    user.subscription_status = "cancelled";
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
  console.log("signature", signature, "expectedSignature", expectedSignature, "\n ", (signature == expectedSignature));
  if (signature !== expectedSignature) {
    return res.status(200).send("Invalid signature");
  }

  console.dir(req.body, { depth: null });
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
exports.getPaymentsByDuration = async (req, res) => {
  try {
    const { duration = "monthly", offset = 0 } = req.query;
    console.log("duration", duration, "offset", offset);
    let fromDate, toDate;

    const offsetNum = parseInt(offset, 10);
    const today = moment().tz("Asia/Kolkata");

    if (duration === "monthly") {
      fromDate = today.clone().startOf("month").subtract(offsetNum, "months");
      toDate = today.clone().endOf("month").subtract(offsetNum, "months");
    } else if (duration === "weekly") {
      fromDate = today.clone().startOf("isoWeek").subtract(offsetNum, "weeks");
      toDate = today.clone().endOf("isoWeek").subtract(offsetNum, "weeks");
    } else if (duration === "yearly") {
      fromDate = today.clone().startOf("year").subtract(offsetNum, "years");
      toDate = today.clone().endOf("year").subtract(offsetNum, "years");
    } else {
      return res.status(400).json({ success: false, message: "Invalid duration" });
    }

    const from = Math.floor(fromDate.valueOf() / 1000); // Razorpay expects timestamps in seconds
    const to = Math.floor(toDate.valueOf() / 1000);

    const payments = await razorpayInstance.payments.all({ from, to });

    res.json({
      success: true,
      duration,
      range: { from: fromDate.format(), to: toDate.format() },
      count: payments.count,
      payments: payments.items,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};


exports.getPaymentsSummary = async (req, res) => {
  try {
    const ranges = {
      current_month: {
        from: moment().startOf("month").unix(),
        to: moment().endOf("month").unix(),
      },
      previous_month: {
        from: moment().subtract(1, "month").startOf("month").unix(),
        to: moment().subtract(1, "month").endOf("month").unix(),
      },
      current_week: {
        from: moment().startOf("week").unix(),
        to: moment().endOf("week").unix(),
      },
      previous_week: {
        from: moment().subtract(1, "week").startOf("week").unix(),
        to: moment().subtract(1, "week").endOf("week").unix(),
      },
      current_year: {
        from: moment().startOf("year").unix(),
        to: moment().endOf("year").unix(),
      },
      previous_year: {
        from: moment().subtract(1, "year").startOf("year").unix(),
        to: moment().subtract(1, "year").endOf("year").unix(),
      },
    };

    const summary = {};

    for (const [key, range] of Object.entries(ranges)) {
      const payments = await razorpayInstance.payments.all({
        from: range.from,
        to: range.to,
        count: 100, // increase with pagination if needed
      });

      let totalAmount = 0;
      let successCount = 0;
      let failedCount = 0;

      payments.items.forEach((p) => {
        if (p.status === "captured") {
          totalAmount += p.amount;
          successCount++;
        } else {
          failedCount++;
        }
      });

      summary[key] = {
        total: totalAmount / 100, // in INR
        successCount,
        failedCount,
      };
    }

    const data = {
      month: {
        current: summary.current_month.total,
        previous: summary.previous_month.total,
        change_percentage: calculatePercentageChange(summary.current_month.total, summary.previous_month.total),
        successCount: summary.current_month.successCount,
        previousSuccessCount: summary.previous_month.successCount,
        successChangePercentage: calculatePercentageChange(summary.current_month.successCount, summary.previous_month.successCount),
        failedCount: summary.current_month.failedCount,
      },
      week: {
        current: summary.current_week.total,
        previous: summary.previous_week.total,
        change_percentage: calculatePercentageChange(summary.current_week.total, summary.previous_week.total),
        successCount: summary.current_week.successCount,
        previousSuccessCount: summary.previous_week.successCount,
        successChangePercentage: calculatePercentageChange(summary.current_week.successCount, summary.previous_week.successCount),
        failedCount: summary.current_week.failedCount,
      },
      year: {
        current: summary.current_year.total,
        previous: summary.previous_year.total,
        change_percentage: calculatePercentageChange(summary.current_year.total, summary.previous_year.total),
        successCount: summary.current_year.successCount,
        previousSuccessCount: summary.previous_year.successCount,
        successChangePercentage: calculatePercentageChange(summary.current_year.successCount, summary.previous_year.successCount),
        failedCount: summary.current_year.failedCount,
      },
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error("Payment summary fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch summary" });
  }
};

exports.upgradeSubscription = async (req, res) => {
  try {
    const { userId, newPlanId } = req.body;

    const user = await User.findById(userId);
    if (!user || user.subscription_status !== "active") {
      return res.status(400).json({ success: false, message: "No active subscription found" });
    }

    const currentSubId = user.razorpay_subscription_id;
    const currentPlan = await SubscriptionPlan.findOne({ razorpay_plan_id: user.razorpay_plan_id });
    const newPlan = await SubscriptionPlan.findOne({ razorpay_plan_id: newPlanId });

    if (!newPlan || !newPlan.isActive) {
      return res.status(400).json({ success: false, message: "Invalid or inactive new plan" });
    }

    // Fetch subscription and payments
    const subscription = await razorpayInstance.subscriptions.fetch(currentSubId);
    const payments = await razorpayInstance.payments.all({ subscription_id: currentSubId });

    const lastPayment = payments.items.find(p => p.status === 'captured');
    if (!lastPayment) {
      return res.status(400).json({ success: false, message: "No captured payment found" });
    }

    // Calculate remaining days
    const now = moment();
    const end = moment.unix(subscription.current_end);
    const start = moment.unix(subscription.current_start);
    const totalDays = end.diff(start, 'days');
    const remainingDays = end.diff(now, 'days');


    const refundAmount = Math.round((remainingDays / totalDays) * lastPayment.amount);

    // Refund the remaining amount
    const refund = await razorpayInstance.payments.refund(lastPayment.id, {
      amount: refundAmount,
      speed: 'optimum',
    });

    // Cancel existing subscription
    await razorpayInstance.subscriptions.cancel(currentSubId);

    // Create new subscription
    const newSubscription = await razorpayInstance.subscriptions.create({
      plan_id: newPlan.razorpay_plan_id,
      customer_notify: 1,
      total_count: 12,
    });

    // Update user
    user.razorpay_plan_id = newPlan.razorpay_plan_id;
    user.razorpay_subscription_id = newSubscription.id;
    user.subscription_status = newSubscription.status;
    user.subscription_start = new Date(newSubscription.start_at * 1000);
    user.subscription_end = new Date(newSubscription.end_at * 1000);
    user.subscription_status = "created";

    // user.subscription_renewal_history.push({
    //   subscription_id: newSubscription.id,
    //   start_date: new Date(newSubscription.start_at * 1000),
    //   end_date: new Date(newSubscription.end_at * 1000),
    //   renewed_at: new Date(),
    //   status: "active",
    // });

    await user.save();

    res.json({
      success: true,
      message: "Subscription upgraded",
      refund: refund,
      newSubscription,
      subscriptionId: newSubscription.id,
      subscription: newSubscription,
    });

  } catch (error) {
    console.error("Upgrade subscription error:", error);
    res.status(500).json({ success: false, message: "Subscription upgrade failed" });
  }
};

exports.deletePlanAndRefundUsers = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await SubscriptionPlan.findOne({ razorpay_plan_id: planId });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    // Find users actively using this plan
    const users = await User.find({
      razorpay_plan_id: planId,
      subscription_status: "active",
    });

    const refunds = [];

    for (const user of users) {
      try {
        const subscription = await razorpayInstance.subscriptions.fetch(user.razorpay_subscription_id);
        const payments = await razorpayInstance.payments.all({
          subscription_id: subscription.id,
          count: 100,
        });

        const lastPayment = payments.items.find(p => p.status === "captured");
        if (!lastPayment) continue;

        const now = moment();
        const start = moment.unix(subscription.current_start);
        const end = moment.unix(subscription.current_end);

        const totalDays = end.diff(start, 'days');
        const remainingDays = end.diff(now, 'days');

        if (remainingDays <= 0 || totalDays <= 0) continue;

        const refundAmount = Math.round((remainingDays / totalDays) * lastPayment.amount);

        // Refund
        const refund = await razorpayInstance.payments.refund(lastPayment.id, {
          amount: refundAmount,
          speed: 'optimum',
        });

        // Cancel subscription
        await razorpayInstance.subscriptions.cancel(subscription.id);

        // Update user
        user.subscription_status = "cancelled";
        user.subscription_end = new Date();
        await user.save();

        refunds.push({
          userId: user._id,
          refundId: refund.id,
          refundedAmount: refundAmount / 100,
        });

      } catch (innerError) {
        console.error(`Error refunding user ${user._id}:`, innerError.message);
        continue;
      }
    }

    // Finally, delete the plan from DB (note: Razorpay does not support deleting plans from their API)
    plan.isActive = false;
    await plan.save();

    res.json({
      success: true,
      message: "Plan deleted and eligible users refunded",
      refundedUsers: refunds,
    });

  } catch (error) {
    console.error("Error deleting plan and refunding users:", error);
    res.status(500).json({ success: false, message: "Server error during plan deletion" });
  }
};

exports.getAllPlansStatus = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find(); // Find all active plans
    res.json({ success: true, plans }); // Return the list of active plans
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ success: false, message: "Server error while fetching plans" });
  }
};