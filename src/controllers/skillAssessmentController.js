const SkillAssess = require('../Models/skillAssessmentModel');  // Import the SkillAssess model

// Controller to fetch skill assessments based on optional filters
exports.getSkillAssessments = async (req, res) => {
  try {
    // Get query parameters from the request
    const { module_code, topic_code, subtopic_code, question_type,level } = req.query;

    // Create a filter object to build the query based on the optional parameters
    const filter = {isDeleted: false};

    if (module_code) {
      filter.module_code = module_code;
    }
    if (topic_code) {
      filter.topic_code = topic_code;
    }
    if (subtopic_code) {
      filter.subtopic_code = subtopic_code;
    }
    if (question_type) {
      filter.question_type = question_type;
    }
    if(level){
      filter.level = level;
    }

    // Fetch the skill assessments using the dynamic filter
    const skillAssessments = await SkillAssess.find(filter);

    // Check if any skill assessments are found
    if (!skillAssessments.length) {
      return res.status(404).json({ success: false, message: 'No skill assessments found' });
    }

    // Return the found skill assessments
    return res.status(200).json({
      success: true,
      data: skillAssessments,
    });

  } catch (error) {
    // Handle errors (e.g., invalid query parameters)
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching skill assessments',
      error: error.message,
    });
  }
};

exports.getSkillAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const skillAssessment = await SkillAssess.findById(id);
    if (!skillAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Skill assessment not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: skillAssessment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching skill assessment',
      error: error.message,
    });
  }
};

exports.softDeleteSkillAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const skillAssessment = await SkillAssess.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true } }, { new: true });
    if (!skillAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Skill assessment not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Skill assessment deleted successfully',
      skillAssessment: skillAssessment
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting skill assessment',
      error: error.message,  
    });
  }
};
