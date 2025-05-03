const TIYModel = require("../Models/TIYSchemaModel");   

exports.getTIYS = async (req, res) => {
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
    const tiys = await TIYModel.find(filter);

    // Check if any skill assessments are found
    if (!tiys.length) {
      return res.status(404).json({ success: false, message: 'No try it yourself found' });
    }

    // Return the found skill assessments
    return res.status(200).json({
      success: true,
      data: tiys,
    });

  } catch (error) {
    // Handle errors (e.g., invalid query parameters)
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching try it yourself',
      error: error.message,
    });
  }
};

exports.getTIYByID = async (req, res) => {  
  try {
    const { id } = req.params;  
    const tiy = await TIYModel.findById(id);
    if (!tiy) {
      return res.status(404).json({
        success: false,
        message: 'Try it yourself not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: tiy,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching try it yourself question',
      error: error.message,
    });
  }
};

exports.softDeleteTIY = async (req, res) => {
  try {
    const { id } = req.params;
    const tiy = await TIYModel.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true } }, { new: true });
    if (!tiy) {
      return res.status(404).json({
        success: false,
        message: 'Try it yourself not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Try it yourself deleted successfully',
      tiy: tiy
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting try it yourself',
      error: error.message,
    });
  }
};
exports.editTIYQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question= await TIYModel.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question Bank not found',
      })
    }
    if(question.question_type==="mcq" || question.question_type==="approach" ){
     return res.status(400).json({
       success: false,
       message: 'Question Type must be single-line or multi-line',
     })
    }
    const questionbank = await TIYModel.findOneAndUpdate({ _id: id }, req.body, { new: true });
    if (!questionbank) {
      return res.status(404).json({
        success: false,
        message: 'Question Bank not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Question Bank updated successfully',
      questionbank: questionbank
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error updating Question Bank',
      error: error.message,
    });
  }
};

exports.geTIYByModuleCode = async (req, res) => {
  try {
    const { module_code } = req.params;
    const tiys = await TIYModel.find({ module_code: module_code, isDeleted: false });
    if (!tiys.length) {
      return res.status(404).json({ success: false, message: 'No try it yourself found' });
    }
    return res.status(200).json({
      success: true,
      data: tiys,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching try it yourself',
      error: error.message,
    });
  }
};
