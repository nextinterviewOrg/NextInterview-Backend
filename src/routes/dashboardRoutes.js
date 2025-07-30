const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/metrics", dashboardController.getDashboardMetrics);
router.get("/feedback-analytics", dashboardController.getFeedbackAnalytics);
router.get("/user-activity-trends", dashboardController.getUserActivityTrends);
router.get("/learning-activity-insights", dashboardController.getLearningActivityInsights);
router.get("/user-performance-analytics/:userId", dashboardController.getUserPerformanceAnalytics);
router.get("/user-mock-test-analytics/:userId", dashboardController.getUserMockTestAnalytics);

module.exports = router;