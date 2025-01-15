const express = require("express");
const router = express.Router();
const jobResponseController = require("../controllers/jobResponseController");

// Create a new JobResponse
router.post("/", jobResponseController.createJobResponse);

// Get all JobResponses
router.get("/", jobResponseController.getAllJobResponses);

// Get a single JobResponse by ID
router.get("/:id", jobResponseController.getJobResponseById);

// Update a JobResponse
router.put("/:id", jobResponseController.updateJobResponse);

// Delete a JobResponse
router.delete("/:id", jobResponseController.deleteJobResponse);

module.exports = router;
