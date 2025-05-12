const MainQuestionBank = require("../Models/mainQuestionBankModel");
const fs = require("fs");
const csvParser = require("csv-parser");
const { processMainQuestionBankCSV } = require("../utils/utils");



exports.uploadQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
          }
        processMainQuestionBankCSV(req.file.path, MainQuestionBank)
        .then(() => {
            res.status(200).send("CSV file processed and data stored in MongoDB.");
          })
          .catch((err) => {
            console.error("Error processing CSV:", err);
            res.status(500).send("Error processing CSV file.");
          });
      
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await MainQuestionBank.find({isDeleted: false});
        res.status(200).json({ success: true, data: questions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getALLTIYQuestions = async (req, res) => {
  try {
      const questions = await MainQuestionBank.find({isTIYQustion: true,isDeleted: false});
      res.status(200).json({ success: true, data: questions });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.getAllQUestionBankQuestions = async (req, res) => {
  try {
      const questions = await MainQuestionBank.find({isQuestionBank: true,isDeleted: false});
      res.status(200).json({ success: true, data: questions });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.getQuestions = async (req, res) => {
  try {
    // Get query parameters from the request
    const { module_code, topic_code, subtopic_code, question_type,level,question_category } = req.query;

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
    if(question_category){
      if(question_category === 'tiy'){
        filter.isTIYQustion = true;
      }else if(question_category === 'questionBank'){
        filter.isQuestionBank = true;
      }
    }
    filter.isDeleted = false;
    // Fetch the skill assessments using the dynamic filter
    const questions = await MainQuestionBank.find(filter);

    // Check if any skill assessments are found
    if (!questions.length) {
      return res.status(404).json({ success: false, message: 'No Questions found' });
    }

    // Return the found skill assessments
    return res.status(200).json({
      success: true,
      data: questions,
    });

  } catch (error) {
    // Handle errors (e.g., invalid query parameters)
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching Quetions ',
      error: error.message,
    });
  }
};
exports.getQuestionByID = async (req, res) => {
  try {
    const question = await MainQuestionBank.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    return res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.softDeleteQuestion = async (req, res) => {
  try {
    const question = await MainQuestionBank.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    question.isDeleted = true;
    await question.save();
    return res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.editQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await MainQuestionBank.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
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
       const questionbank = await MainQuestionBank.findOneAndUpdate({ _id: id }, req.body, { new: true });
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
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getQuestionsByModuleCode = async (req, res) => {
  try {
    const{question_category} = req.query
    const { module_code } = req.params;
    let filter = {};
    if(question_category){
      if(question_category === 'tiy'){
        filter.isTIYQustion = true;
      }else if(question_category === 'questionBank'){
        filter.isQuestionBank = true;
      }
    }
    filter.isDeleted = false;
    filter.module_code = module_code;
    const questions = await MainQuestionBank.find(filter);    
    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
