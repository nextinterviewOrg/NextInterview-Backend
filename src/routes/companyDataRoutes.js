const express = require("express");
const router = express.Router();
const companyDataController = require("../controllers/companyDataController");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const csvParser = require("csv-parser")
const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null, "uploads/");
  // },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
router.post("/uploadFile", upload.single('file'), companyDataController.uploadCompanies);

// Create a new CompanyData record
router.post("/", companyDataController.createCompanyData);

// Get all CompanyData records
router.get("/", companyDataController.getAllCompanyData);

router.get("/:id", companyDataController.getCompanyDataById);

router.put("/:id", companyDataController.updateCompanyData);

// Delete a CompanyData record
router.delete("/:id", companyDataController.deleteCompanyData);

module.exports = router;
