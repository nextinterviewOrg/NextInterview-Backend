const JobResponse = require("../Models/jobResponseModel");

// Create a new JobResponse
exports.createJobResponse = async (req, res) => {
  try {
    const { response_name } = req.body;

    if (!response_name) {
      return res.status(400).json({
        success: false,
        message: "response_name is required",
      });
    }

    const jobResponse = new JobResponse({ response_name });
    await jobResponse.save();

    res.status(201).json({
      success: true,
      message: "JobResponse created successfully",
      data: jobResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create JobResponse",
      error: err.message,
    });
  }
};

// Get all JobResponses
exports.getAllJobResponses = async (req, res) => {
  try {
    const jobResponses = await JobResponse.find();

    res.status(200).json({
      success: true,
      data: jobResponses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch JobResponses",
      error: err.message,
    });
  }
};

// Get a single JobResponse by ID
exports.getJobResponseById = async (req, res) => {
  try {
    const { id } = req.params;

    const jobResponse = await JobResponse.findById(id);

    if (!jobResponse) {
      return res.status(404).json({
        success: false,
        message: "JobResponse not found",
      });
    }

    res.status(200).json({
      success: true,
      data: jobResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch JobResponse",
      error: err.message,
    });
  }
};

// Update a JobResponse
exports.updateJobResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response_name } = req.body;

    if (!response_name) {
      return res.status(400).json({
        success: false,
        message: "response_name is required to update",
      });
    }

    const jobResponse = await JobResponse.findByIdAndUpdate(
      id,
      { response_name },
      { new: true, runValidators: true }
    );

    if (!jobResponse) {
      return res.status(404).json({
        success: false,
        message: "JobResponse not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "JobResponse updated successfully",
      data: jobResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update JobResponse",
      error: err.message,
    });
  }
};

// Delete a JobResponse
exports.deleteJobResponse = async (req, res) => {
  try {
    const { id } = req.params;

    const jobResponse = await JobResponse.findByIdAndDelete(id);

    if (!jobResponse) {
      return res.status(404).json({
        success: false,
        message: "JobResponse not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "JobResponse deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete JobResponse",
      error: err.message,
    });
  }
};
