const express = require("express");
const { getProgressCount, getProgressCountByFilter } = require("../controllers/moduleProgressController");
const router = express.Router();

router.get("/getmoduleProgressStats",getProgressCount);
router.get("/getmoduleProgressStats/filter",getProgressCountByFilter);

module.exports = router;