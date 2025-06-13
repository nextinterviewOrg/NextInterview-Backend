const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");


router.post("/createPlan", subscriptionController.createPlan);
router.get("/getAllPlans", subscriptionController.getAllPlans);



module.exports = router;