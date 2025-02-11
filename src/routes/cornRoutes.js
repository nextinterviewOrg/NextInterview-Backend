const express = require("express");
const { removeRestrictedUsers } = require("../controllers/cornJobContoller");

const router = express.Router();


// GET CALL to fetch data by ID
router.get("/removeRestriction",removeRestrictedUsers);


module.exports = router;