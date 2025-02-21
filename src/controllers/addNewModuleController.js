const NewModule = require("../Models/addNewModuleModel");
const mongoose = require("mongoose");

const generateNextCode = (lastCode, level) => {
  if (level === 'module') {
    const match = lastCode.match(/\d+$/);
    let firstCharacters = lastCode.substring(0, 3);
    let number = parseInt(match[0], 10);
    number = number + 1;
    if (number > 9999) {
      firstCharacters = firstCharacters.substring(0, 2) + String.fromCharCode(firstCharacters.charCodeAt(firstCharacters.length - 1) + 1);
      return `${firstCharacters}${String(1).padStart(4, '0')}`;
    }
    return `${firstCharacters}${String(number).padStart(4, '0')}`;

  } else if (level === "topic") {
    const match = lastCode.match(/\d+$/);
    let firstCharacters = lastCode.substring(0, 8);
    let number = parseInt(match[0], 10);
    number = number + 1;
    if (number > 999) {
      firstCharacters = firstCharacters.substring(0, 7) + String.fromCharCode(firstCharacters.charCodeAt(firstCharacters.length - 1) + 1);
      return `${firstCharacters}${String(1).padStart(3, '0')}`;
    }
    // console.log("fr", `${firstCharacters}${String(number ).padStart(3, '0')}`)
    return `${firstCharacters}${String(number).padStart(3, '0')}`;
  } else if (level === "subtopic") {

    console.log("'recieved ", lastCode);
    const match = lastCode.match(/\d+$/);
    console.log("match", match)
    let firstCharacters = lastCode.substring(0, 13);
    let number = parseInt(match[0], 10);
    number = number + 1;
    console.log("number", number)
    if (number > 999) {
      firstCharacters = firstCharacters.substring(0, 12) + String.fromCharCode(firstCharacters.charCodeAt(firstCharacters.length - 1) + 1);
      return `${firstCharacters}${String(1).padStart(3, '0')}`;
    }
    console.log("fr", `${firstCharacters}${String(number).padStart(2, '0')}`)
    return `${firstCharacters}${String(number).padStart(2, '0')}`;
  }

};




exports.createNewModule = async (req, res) => {
  try {
    // Step 1: Fetch the latest module code from the database
    const lastModule = await NewModule.findOne().sort({ createdAt: -1 }).limit(1); // Get the latest added module

    // Step 2: Generate module, topic, and subtopic codes
    let moduleCode = "MCA0001"; // Default value for moduleCode when no module exists
    let topicCode = moduleCode + "A000"; // Default value for topicCode when no module exists
    let subtopicCode = topicCode + "A000"; // Default value for subtopicCode when no module exists

    if (lastModule) {
      // Step 3: Generate new codes based on the last module's code
      moduleCode = generateNextCode(lastModule.module_code, "module");
      topicCode = moduleCode + "A000";
      subtopicCode = topicCode + "A000";
    }

    // Step 4: Prepare new module data with generated codes
    const newModuleData = new NewModule({
      ...req.body, // Spread other data from the request body
      module_code: moduleCode,
      topicData: req.body.topicData.map((topic, index) => {

        topicCode = generateNextCode(topicCode, "topic");
        let temp = topicCode;
        subtopicCode = temp + "A000";
        return ({
          ...topic,

          topic_code: topicCode,

          subtopicData: topic.subtopicData.map((subtopic, subIndex) => {
            console.log("subtopic sent ", subtopicCode);
            subtopicCode = generateNextCode(subtopicCode, "subtopic");
            return ({
              ...subtopic,
              subtopic_code: subtopicCode, // Generate subtopic_code based on topic_code
            })
          }),
        })
      }),
    });

    // Step 5: Save the new module to the database
    await newModuleData.save();

    // Step 6: Send a success response with the created module data
    res.status(201).json({
      success: true,
      message: "New Module creation successful",
      data: newModuleData,
    });
  } catch (err) {
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
      const moduleData = await NewModule.find({ isDeleted: false });

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
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch module data",
      error: error.message,
    });
  }
};


// Update Single Module Data
exports.updateModuleDataByID = async (req, res) => {
  try {
    const { id } = req.params;

    const moduleData = await NewModule.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: moduleData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update Module",
      error: err.message,
    });
  }
};

exports.getAllModuleCodes = async (req, res) => {
  try {
    const modules = await NewModule.find({}, 'module_code moduleName'); // Fetch only the module_code field
    const moduleCodes = modules.map((module) => {
      return ({
        module_code: module.module_code,
        module_name: module.moduleName
      })
    }); // Extract all module_codes

    res.status(200).json({
      success: true,
      message: 'Module codes retrieved successfully',
      data: moduleCodes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve module codes',
      error: err.message,
    });
  }
};
exports.getTopicCodesByModuleCode = async (req, res) => {
  const { moduleCode } = req.params;

  try {
    // Find the module by module_code and populate the topicData array
    const module = await NewModule.findOne({ module_code: moduleCode }, 'topicData');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    // Extract topic codes from the module
    const topicCodes = module.topicData.map(topic => { return ({ topic_code: topic.topic_code, topic_name: topic.topicName }) });

    res.status(200).json({
      success: true,
      message: 'Topic codes retrieved successfully',
      data: topicCodes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve topic codes',
      error: err.message,
    });
  }
};

exports.getSubtopicCodesByModuleAndTopicCode = async (req, res) => {
  const { moduleCode, topicCode } = req.params;

  try {
    // Find the module by module_code and topic_code, and populate the subtopicData array
    const module = await NewModule.findOne(
      { module_code: moduleCode, 'topicData.topic_code': topicCode },

    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module or topic not found',
      });
    }

    // Find the specific topic in the topicData array
    const topic = module.topicData.find(t => t.topic_code === topicCode);

    // Extract subtopic codes from the topic
    const subtopicCodes = topic.subtopicData.map(subtopic => { return ({ subTopic_code: subtopic.subtopic_code, subTopic_name: subtopic.subtopicName }) });

    res.status(200).json({
      success: true,
      message: 'Subtopic codes retrieved successfully',
      data: subtopicCodes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subtopic codes',
      error: err.message,
    });
  }
};

exports.softDeleteModule = async (req, res) => {
  try {
    const id = req.params.id;
    const moduleData = await NewModule.findOneAndUpdate({ module_code: id }, { $set: { isDeleted: true } }, { new: true });

    if (!moduleData) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
      moduleData: moduleData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete module",
      error: error.message,
    });
  }
};

