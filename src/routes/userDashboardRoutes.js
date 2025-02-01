const express = require("express");
const router = express.Router();

const userDashboardController = require("../controllers/userDashboardController");

// GET CALL to fetch data by UID
router.get("/:id", userDashboardController.fetchDataByID);

module.exports = router;
