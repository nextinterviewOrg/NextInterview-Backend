const express = require("express");
const router = express.Router();
const companyDataController = require("../controllers/companyDataController");

// Create a new CompanyData record
router.post("/", companyDataController.createCompanyData);

// Get all CompanyData records
router.get("/", companyDataController.getAllCompanyData);

router.get("/:id", companyDataController.getCompanyDataById);

router.put("/:id", companyDataController.updateCompanyData);

// Delete a CompanyData record
router.delete("/:id", companyDataController.deleteCompanyData);

module.exports = router;
