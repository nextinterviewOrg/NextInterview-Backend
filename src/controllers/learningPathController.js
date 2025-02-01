const LearningPath = require("../Models/learningPathModel");

// Fetch Path Data by UID
exports.getLearningPathById = async (req, res) => {
  try {
    const { id } = req.params;
    const pathData = await LearningPath.findById(id);

    if (!pathData) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pathData,
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch module data",
      error: err.message,
    });
  }
};
