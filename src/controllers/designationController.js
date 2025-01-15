const Designation = require("../models/designationModel");

// Create a new Designation
exports.createDesignation = async (req, res) => {
  try {
    const { designation_name } = req.body;

    if (!designation_name) {
      return res.status(400).json({
        success: false,
        message: "designation_name is required",
      });
    }

    const designation = new Designation({ designation_name });
    await designation.save();

    res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: designation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create Designation",
      error: err.message,
    });
  }
};

// Get all Designations
exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.find();

    res.status(200).json({
      success: true,
      data: designations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Designations",
      error: err.message,
    });
  }
};

// Get a single Designation by ID
exports.getDesignationById = async (req, res) => {
  try {
    const { id } = req.params;

    const designation = await Designation.findById(id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: designation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Designation",
      error: err.message,
    });
  }
};

// Update a Designation
exports.updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { designation_name } = req.body;

    if (!designation_name) {
      return res.status(400).json({
        success: false,
        message: "designation_name is required to update",
      });
    }

    const designation = await Designation.findByIdAndUpdate(
      id,
      { designation_name },
      { new: true, runValidators: true }
    );

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designation updated successfully",
      data: designation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update Designation",
      error: err.message,
    });
  }
};

// Delete a Designation
exports.deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;

    const designation = await Designation.findByIdAndDelete(id);

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Designation deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete Designation",
      error: err.message,
    });
  }
};
