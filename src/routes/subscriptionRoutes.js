const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");


router.post("/createPlan", subscriptionController.createPlan);
router.get("/getAllPlans", subscriptionController.getAllPlans);
router.post("/createSubscription", subscriptionController.createSubscription);
router.post("/webhook-subscription", subscriptionController.razorpayWebhook);
router.get("/getSubscriptionByUserId/:userId", subscriptionController.getUserSubscription);
router.post("/cancelSubscription", subscriptionController.cancelSubscription);
router.post("/getAllPayments", subscriptionController.getPaymentsByDuration);
router.get("/getPaymentSummary", subscriptionController.getPaymentsSummary); 
router.post("/upgradePlan", subscriptionController.upgradeSubscription); 
router.delete("/softDelete/:planId", subscriptionController.deletePlanAndRefundUsers);
router.get("/getAllPlansStatus", subscriptionController.getAllPlansStatus);
router.put("/togglePlanStatus/:id", subscriptionController.togglePlanStatus);
module.exports = router;