const QuestionBank = require("../Models/questionBankModel");

// Creation of New Modules
exports.createQuestionBank = async (req, res) => {
  try {
    {
      const questionData = new QuestionBank(req.body);
      await questionData.save();
      res.status(201).json({
        success: true,
        message: "New Questions creation successful",
        data: questionData,
      });
    }
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create new questions",
      error: err.message,
    });
  }
};

// Fetch Module Data
exports.getQuestions = async (req, res) => {
  try {
    {
      const questionData = await QuestionBank.find();

      res.status(200).json({
        success: true,
        data: questionData,
      });
    }
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: err.message,
    });
  }
};

// Fetch Single Module Data
exports.getQuestionsByID = async (req, res) => {
  try {
    const { id } = req.params;
    const questionData = await QuestionBank.findById(id);

    if (!questionData) {
      return res.status(404).json({
        success: false,
        message: "Question ID not found",
      });
    }

    res.status(200).json({
      success: true,
      data: questionData,
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: err.message,
    });
  }
};
