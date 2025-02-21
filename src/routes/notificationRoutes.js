//notificationRoutes
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.post("/send", notificationController.sendNotification);
router.get("/get", notificationController.getAllNotifications);
router.delete("/deleteNotification/:id", notificationController.deleteNotification);   
router.put("/updateNotification/:id", notificationController.updateNotification);
router.post("/notificationRead/:userId/:notificationId", notificationController.markNotificationAsRead);
router.get("/getNotificationByUser/:userId", notificationController.getNotificationByUserId);
module.exports = router;