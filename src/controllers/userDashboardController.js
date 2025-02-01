const userData = require("../Models/userDashboardModel");

exports.fetchDataByID = async (req, res) => {
  try {
    const { id } = req.params;
    const uData = await userData.findById(id);

    if (!uData) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    res.status(200).json({
      success: true,
      data: uData,
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
      error: err.message,
    });
  }
};
