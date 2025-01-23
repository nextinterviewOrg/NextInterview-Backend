const express = require("express");
const router = express.Router();

const addNewModuleController = require("../controllers/addNewModuleController");

// POST CALL to upload module
router.post("/", addNewModuleController.createNewModule);

// GET CALL to fetch data
router.get("/", addNewModuleController.getModuleData);

module.exports = router;
