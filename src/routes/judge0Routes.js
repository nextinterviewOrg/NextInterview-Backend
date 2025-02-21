const express = require("express");
const { getJude0Languages, submitCode, getOutput } = require("../controllers/jude0Controller");
const router = express.Router();


 router.get("/languages", getJude0Languages);
 router.post("/submitcode", submitCode);
 router.post("/getOutput", getOutput);

module.exports = router;