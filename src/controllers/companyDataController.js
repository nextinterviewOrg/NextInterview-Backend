const CompanyData = require("../Models/companyDataModel");
const { processCompanyCSV } = require("../utils/utils");

// Create a new CompanyData
exports.createCompanyData = async (req, res) => {
  try {
    const { company_name, company_description, company_website, company_logo } = req.body;

    if (!company_name || !company_description || !company_website || !company_logo) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const companyData = new CompanyData({
      company_name,
      company_description,
      company_website,
      company_logo,
    });

    await companyData.save();

    res.status(201).json({
      success: true,
      message: "Company data created successfully",
      data: companyData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create company data",
      error: err.message,
    });
  }
};

exports.uploadCompanies = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    processCompanyCSV(req.file.path, CompanyData)
      .then(() => {
        res.status(200).send("CSV file processed and data stored in MongoDB.");
      })
      .catch((err) => {
        console.error("Error processing CSV:", err);
        res.status(500).send("Error processing CSV file.");
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all CompanyData records
exports.getAllCompanyData = async (req, res) => {
  try {
    const companies = await CompanyData.find();

    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company data",
      error: err.message,
    });
  }
};

// Get a single CompanyData by ID
exports.getCompanyDataById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await CompanyData.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company data not found",
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company data",
      error: err.message,
    });
  }
};

// Update a CompanyData record
exports.updateCompanyData = async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, company_description, company_website, company_logo } = req.body;

    const updatedFields = {};
    if (company_name) updatedFields.company_name = company_name;
    if (company_description) updatedFields.company_description = company_description;
    if (company_website) updatedFields.company_website = company_website;
    if (company_logo) updatedFields.company_logo = company_logo;

    const company = await CompanyData.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company data not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company data updated successfully",
      data: company,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update company data",
      error: err.message,
    });
  }
};

// Delete a CompanyData record
exports.deleteCompanyData = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await CompanyData.findByIdAndDelete(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company data not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company data deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete company data",
      error: err.message,
    });
  }
};
