const express = require("express");
const router = express.Router();

const supportQueryController = require("../controllers/supportQueryController");


router.post("/", supportQueryController.createSupportQuery);
router.get("/:id", supportQueryController.getSupportQueryById);
router.get("/getQuery/all", supportQueryController.getAllSupportQuery);
router.put("/updatequery/:id", supportQueryController.updateSupportQuery);
router.get("/getSupportStatistics/stats", supportQueryController.getSupportQueryStats);
router.post('/support/:id/admin-message', supportQueryController.addAdminMessageToSupportQuery);
module.exports = router;