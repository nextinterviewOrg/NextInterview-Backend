const NewModule = require("../Models/addNewModuleModel");

// Creation of New Modules
exports.createNewModule = async (req, res) => {
  try {
    {
      const newModuleData = new NewModule(req.body);
      await newModuleData.save();
      res.status(201).json({
        success: true,
        message: "New Module creation successful",
        data: newModuleData,
      });
    }
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create new module",
      error: err.message,
    });
  }
};

// Fetch Module Data
exports.getModuleData = async (req, res) => {
  try {
    {
      const moduleData = await NewModule.find();

      res.status(200).json({
        success: true,
        data: moduleData,
      });
    }
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch module data",
      error: err.message,
    });
  }
};
