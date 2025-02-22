const express = require("express");
const { updateUserProgressModel } = require("../controllers/userProgressController");

const router = express.Router();




router.post("/updateUserProgress",updateUserProgressModel);

module.exports = router;