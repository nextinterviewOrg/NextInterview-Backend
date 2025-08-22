const express = require("express");
const router = express.Router();
const auth = require("../middleware/authorizeRole");
const supportQueryController = require("../controllers/supportQueryController");


router.post("/", supportQueryController.createSupportQuery);
router.get("/:id", supportQueryController.getSupportQueryById);
router.get("/getQuery/all", supportQueryController.getAllSupportQuery);
router.put("/updatequery/:id", supportQueryController.updateSupportQuery);
router.get("/getSupportStatistics/stats", supportQueryController.getSupportQueryStats);

router.post("/:queryId/admin-message", supportQueryController.sendMessageFromAdmin);

// Send message from user to admin
router.post("/:queryId/user-message", supportQueryController.sendMessageFromUser);

// Get chat log for a specific query
router.get("/:queryId/chatlog", supportQueryController.getChatLog);

// Get support queries by user ID
router.get("/user/:userId", supportQueryController.getSupportQueriesByUser);
module.exports = router;