const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");


router.post("/createPlan", subscriptionController.createPlan);
router.get("/getAllPlans", subscriptionController.getAllPlans);
router.post("/createSubscription", subscriptionController.createSubscription);
router.post("/webhook-subscription", subscriptionController.razorpayWebhook);
router.get("/getSubscriptionByUserId/:userId", subscriptionController.getUserSubscription);

module.exports = router;