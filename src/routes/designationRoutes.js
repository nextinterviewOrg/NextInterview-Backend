const express = require("express");
const router = express.Router();
const designationController = require("../controllers/designationController");

// Create a new Designation
router.post("/", designationController.createDesignation);

// Get all Designations
router.get("/", designationController.getAllDesignations);

// Get a single Designation by ID
router.get("/:id", designationController.getDesignationById);

// Update a Designation
router.put("/:id", designationController.updateDesignation);

// Delete a Designation
router.delete("/:id", designationController.deleteDesignation);

module.exports = router;
