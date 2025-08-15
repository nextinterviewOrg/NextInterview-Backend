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
      const moduleData = await NewModule.find({ isDeleted: { $ne: true } });

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

exports.getModulesWithRevisionPoints = async (req, res) => {
  try {
    // Using aggregation for better performance
    const modules = await NewModule.aggregate([
      // First match non-deleted modules
      { $match: { isDeleted: { $ne: true } } },
      
      // Unwind the topicData array
      { $unwind: "$topicData" },
      
      // Unwind the subtopicData array
      { $unwind: "$topicData.subtopicData" },
      
      // Match only subtopics with non-empty revisionPoints
      { $match: { 
        "topicData.subtopicData.revisionPoints": { 
          $exists: true, 
          $ne: null, 
          $ne: "" 
        }
      }},
      
      // Group back by module ID
      {
        $group: {
          _id: "$_id",
          root: { $first: "$$ROOT" }, // Preserve the original document structure
          topics: { $push: "$topicData" } // Collect all matching topics
        }
      },
      
      // Reconstruct the topicData array with only matching topics
      {
        $addFields: {
          "root.topicData": "$topics"
        }
      },
      
      // Replace root with the reconstructed document
      {
        $replaceRoot: { newRoot: "$root" }
      },
      
      // Optional: Filter out any documents that might have empty topicData after filtering
      {
        $match: {
          "topicData.0": { $exists: true }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: modules,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch modules with revision points",
      error: error.message,
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
    const updateData = req.body;

    // First get the existing module to preserve codes
    const existingModule = await NewModule.findById(id);
    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Preserve the module code
    updateData.module_code = existingModule.module_code;

    // Process topic data if it exists in the update
    if (updateData.topicData) {
      // Find the last topic code in existing module to continue numbering
      let lastTopicCode = existingModule.topicData.length > 0 
        ? existingModule.topicData[existingModule.topicData.length - 1].topic_code 
        : existingModule.module_code + "A000";

      updateData.topicData = updateData.topicData.map((topic, index) => {
        // If topic exists in original module, preserve its code
        const existingTopic = index < existingModule.topicData.length 
          ? existingModule.topicData[index] 
          : null;

        // Use existing code if available, otherwise generate next code
        const topicCode = existingTopic 
          ? existingTopic.topic_code 
          : generateNextCode(lastTopicCode, "topic");
        
        // Update lastTopicCode for next iteration
        lastTopicCode = topicCode;

        // Process subtopics
        let lastSubtopicCode = existingTopic && existingTopic.subtopicData.length > 0
          ? existingTopic.subtopicData[existingTopic.subtopicData.length - 1].subtopic_code
          : topicCode + "A000";

        const subtopicData = topic.subtopicData.map((subtopic, subIndex) => {
          // If subtopic exists in original module, preserve its code
          const existingSubtopic = existingTopic && subIndex < existingTopic.subtopicData.length
            ? existingTopic.subtopicData[subIndex]
            : null;

          // Use existing code if available, otherwise generate next code
          const subtopicCode = existingSubtopic
            ? existingSubtopic.subtopic_code
            : generateNextCode(lastSubtopicCode, "subtopic");
          
          // Update lastSubtopicCode for next iteration
          lastSubtopicCode = subtopicCode;

          return {
            ...subtopic,
            subtopic_code: subtopicCode,
          };
        });

        return {
          ...topic,
          topic_code: topicCode,
          subtopicData: subtopicData,
        };
      });
    }

    const moduleData = await NewModule.findByIdAndUpdate(id, updateData, {
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

// Assuming 'NewModule' is your Mongoose model for modules
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
      moduleData: moduleData,
    });
  } catch (error) {
    console.error("Error during soft delete:", error); // More specific error logging
    res.status(500).json({
      success: false,
      message: "Failed to delete module",
      error: error.message,
    });
  }
};

exports.getModuleLastTopic = async (req, res) => {
  try {
    const { moduleCode } = req.body;
    const module = await NewModule.findOne({ module_code: moduleCode });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const lastTopic = module.topicData[module.topicData.length - 1];

    res.status(200).json({
      success: true,
      message: "Last topic retrieved successfully",
      data: lastTopic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get last topic",
      error: error.message
    })
  }
};

exports.getModuleTopicLastSubtopic = async (req, res) => {
  try {
    const { moduleCode, topicCode } = req.body;
    const module = await NewModule.findOne({ module_code: moduleCode });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const topic = module.topicData.find(topic => topic.topic_code === topicCode);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    const lastSubtopic = topic.subtopicData[topic.subtopicData.length - 1];

    res.status(200).json({
      success: true,
      message: "Last subtopic retrieved successfully",
      data: lastSubtopic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get last subtopic",
      error: error.message
    })
  }
};

exports.getModuleByModuleCode = async (req, res) => {
  try {
    const { moduleCode } = req.params;
    const module = await NewModule.findOne({ module_code: moduleCode });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Module retrieved successfully",
      data: module,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get module",
      error: error.message
    })
  }
};
exports.getFavoriteTopics = async (req, res) => {
  try {
    const results = await NewModule.aggregate([
      {
        $match: { isDeleted: false }  // Only include active modules
      },
      {
        $project: {
          moduleId: { $toString: "$_id" },
          moduleName: 1,
          module_code: 1,
          imageURL: 1,
          topicData: {
            $map: {
              input: {
                $filter: {
                  input: "$topicData",
                  as: "topic",
                  cond: {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$$topic.subtopicData",
                            as: "sub",
                            cond: { $eq: ["$$sub.interviewFavorite", true] }
                          }
                        }
                      },
                      0
                    ]
                  }
                }
              },
              as: "topic",
              in: {
                topicName: "$$topic.topicName",
                topic_code: "$$topic.topic_code",
                skillAssessmentQuestionsURL: "$$topic.skillAssessmentQuestionsURL",
                subtopicData: {
                  $filter: {
                    input: "$$topic.subtopicData",
                    as: "sub",
                    cond: { $eq: ["$$sub.interviewFavorite", true] }
                  }
                }
              }
            }
          }
        }
      },
      {
        $match: {
          "topicData.0": { $exists: true }  // Only include modules that still have topics
        }
      }
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get favorite topics and subtopics",
      error: error.message
    });
  }
};



exports.getModuleDetailsByCode = async (req, res) => {
  try {
    const { moduleId } = req.params; // Assuming module_code is passed as a URL parameter

    // Find the module by code, excluding deleted modules
    const module = await NewModule.findOne(
      { _id: moduleId, isDeleted: false },
      {
        moduleName: 1,
        module_code: 1,
        "topicData.topicName": 1,
        "topicData.topic_code": 1,
        _id: 0 // Exclude the default _id field
      }
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found or has been deleted",
      });
    }

    // Format the response to include only what's needed
    const response = {
      moduleName: module.moduleName,
      module_code: module.module_code,
      topics: module.topicData.map(topic => ({
        topicName: topic.topicName,
        topic_code: topic.topic_code
      }))
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching module details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
