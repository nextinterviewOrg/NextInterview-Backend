const express = require("express");
const router = express.Router();

const addNewModuleController = require("../controllers/addNewModuleController");

// POST CALL to upload module
router.post("/", addNewModuleController.createNewModule);

// GET CALL to fetch data
router.get("/", addNewModuleController.getModuleData);

// DELETE CALL to delete module
router.delete("/:id", addNewModuleController.deleteModule);
// GET CALL to fetch data by ID
router.get("/", addNewModuleController.getModuleDataByID);

module.exports = router;
