const express = require("express");
const router = express.Router();
const companyDataController = require("../controllers/companyDataController");

// Create a new CompanyData record
router.post("/", companyDataController.createCompanyData);

// Get all CompanyData records
router.get("/", companyDataController.getAllCompanyData);

// Get a single CompanyData record by ID
router.get("/:id", companyDataController.getCompanyDataById);

// Update a CompanyData record
router.put("/:id", companyDataController.updateCompanyData);

// Delete a CompanyData record
router.delete("/:id", companyDataController.deleteCompanyData);

module.exports = router;
