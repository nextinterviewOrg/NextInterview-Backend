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
// Delete Module Data
exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const moduleData = await NewModule.findByIdAndDelete(id);
 
    if (!moduleData) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }
 
    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete module",
      error: err.message,
    });
  }
};
// Fetch Single Module Data
exports.getModuleDataByID = async (req, res) => {
  try {
    const { id } = req.params;
    const moduleData = await NewModule.findById(id);
 
    if (!moduleData) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }
 
    res.status(200).json({
      success: true,
      data: moduleData,
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
