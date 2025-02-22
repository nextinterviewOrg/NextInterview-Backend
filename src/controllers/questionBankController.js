const QuestionBank = require("../Models/questionBankModel");

// Creation of New Modules


// Fetch Module Data
exports.getQuestionBank = async (req, res) => {
  try {
    // Get query parameters from the request
    const { module_code, topic_code, subtopic_code, question_type, level } = req.query;

    // Create a filter object to build the query based on the optional parameters
    const filter = {};

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
    const questionbanks = await QuestionBank.find(filter);

    // Check if any skill assessments are found
    if (!questionbanks.length) {
      return res.status(404).json({ success: false, message: 'No Qusetion Banks found' });
    }

    // Return the found skill assessments
    return res.status(200).json({
      success: true,
      data: questionbanks,
    });

  } catch (error) {
    // Handle errors (e.g., invalid query parameters)
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching Question Banks',
      error: error.message,
    });
  }
};

exports.getQuestionBankByID = async (req, res) => {
  try {
    const { id } = req.params;
    const questionbank = await QuestionBank.findById(id);
    if (!questionbank) {
      return res.status(404).json({
        success: false,
        message: 'Question Bank not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: questionbank,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching Question Bank',
      error: error.message,
    });
  }
};

exports.softDeleteQuestionBank = async (req, res) => {
  try {
    const { id } = req.params;
    const questionbank = await QuestionBank.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true } }, { new: true });
    if (!questionbank) {
      return res.status(404).json({
        success: false,
        message: 'Question Bank not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Question Bank deleted successfully',
      questionbank: questionbank
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting Question Bank',
      error: error.message,
    });
  }
};
