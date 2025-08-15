const MainQuestionBank = require("../Models/mainQuestionBankModel");
const mongoose = require("mongoose");
const fs = require("fs");
const csvParser = require("csv-parser");
const { processMainQuestionBankCSV } = require("../utils/utils");
const UserMainQuestionBankProgress = require("../Models/userMainQuestionBankProgressModel");
const NewModule = require("../Models/addNewModuleModel");
const QuestionBankCategory = require("../Models/questionBankCategoryModel");

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
    const questions = await MainQuestionBank.find({ isDeleted: false });
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.getALLTIYQuestions = async (req, res) => {
  try {
    const questions = await MainQuestionBank.find({ isTIYQustion: true, isDeleted: false });
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.getAllQUestionBankQuestions = async (req, res) => {
  try {
    const questions = await MainQuestionBank.find({ isQuestionBank: true, isDeleted: false });
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.getQuestions = async (req, res) => {
  try {
    // Get query parameters from the request
    const { module_code, topic_code, subtopic_code, question_type, level, question_category } = req.query;
    const { userId } = req.params

    // Create a filter object to build the query based on the optional parameters
    const filter = { isDeleted: false };

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
    if (level) {
      filter.level = level;
    }
    if (question_category) {
      if (question_category === 'tiy') {
        filter.isTIYQustion = true;
      } else if (question_category === 'questionBank') {
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
    const questionsWithAttemptStatus = await Promise.all(questions.map(async (question) => {
      const module = await NewModule.findOne({ module_code: question.module_code });
      let attempted = false;
      let attemptDetails = null;
      const userProgress = await UserMainQuestionBankProgress.findOne({
        moduleId: module._id,
        "progress.userId": userId
      });
      if (userProgress) {
        const userAttempt = userProgress.progress[0]?.answered_Questions.find(
          q => q.questionBankId === question._id.toString()
        );

        if (userAttempt) {
          attempted = true;
          attemptDetails = {
            answer: userAttempt.answer,
            finalResult: userAttempt.finalResult,
            output: userAttempt.output,
            choosen_option: userAttempt.choosen_option
          };
        }
      }


      return {
        ...question.toObject(),
        attempted,
        attemptDetails: attempted ? attemptDetails : null
      };
    }));
    // Return the found skill assessments
    return res.status(200).json({
      success: true,
      data: questionsWithAttemptStatus,
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
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }

    // Soft delete using updateOne to avoid triggering validation
    const result = await MainQuestionBank.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    return res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Soft delete error:', error);
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
    if (question.question_type === "mcq" || question.question_type === "approach") {
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
    const { question_category } = req.query
    const { module_code, userId } = req.params;
    let filter = {};
    if (question_category) {
      if (question_category === 'tiy') {
        filter.isTIYQustion = true;
      } else if (question_category === 'questionBank') {
        filter.isQuestionBank = true;
      }
    }
    filter.isDeleted = false;
    filter.module_code = module_code;
    const questions = await MainQuestionBank.find(filter);
    const questionsWithAttemptStatus = await Promise.all(questions.map(async (question) => {
      const module = await NewModule.findOne({ module_code: question.module_code });
      let attempted = false;
      let attemptDetails = null;
      const userProgress = await UserMainQuestionBankProgress.findOne({
        moduleId: module._id,
        "progress.userId": userId
      });
      if (userProgress) {
        const userAttempt = userProgress.progress[0]?.answered_Questions.find(
          q => q.questionBankId === question._id.toString()
        );

        if (userAttempt) {
          attempted = true;
          attemptDetails = {
            answer: userAttempt.answer,
            finalResult: userAttempt.finalResult,
            output: userAttempt.output,
            choosen_option: userAttempt.choosen_option
          };
        }
      }


      return {
        ...question.toObject(),
        attempted,
        attemptDetails: attempted ? attemptDetails : null
      };
    }));
    return res.status(200).json({ success: true, data: questionsWithAttemptStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.addCodingQuestion = async (req, res) => {
  try {
    const newQuestion = new MainQuestionBank(req.body);
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCodingQuestion = async (req, res) => {
  try {
    const updatedQuestion = await MainQuestionBank.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Question updated successfully",
      data: updatedQuestion
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.getAllQuestionsWithAttemptStatus = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming userId is passed as a parameter

    // Fetch all non-deleted questions
    const questions = await MainQuestionBank.find({ isDeleted: false });
    // Get user's progress data


    // Map questions with attempt status
    const questionsWithAttemptStatus = await Promise.all(questions.map(async (question) => {
      const module = await NewModule.findOne({ module_code: question.module_code });
      let attempted = false;
      let attemptDetails = null;
      const userProgress = await UserMainQuestionBankProgress.findOne({
        moduleId: module._id,
        "progress.userId": userId
      });
      if (userProgress) {
        const userAttempt = userProgress.progress[0]?.answered_Questions.find(
          q => q.questionBankId === question._id.toString()
        );

        if (userAttempt) {
          attempted = true;
          attemptDetails = {
            answer: userAttempt.answer,
            finalResult: userAttempt.finalResult,
            output: userAttempt.output,
            choosen_option: userAttempt.choosen_option
          };
        }
      }


      return {
        ...question.toObject(),
        attempted,
        attemptDetails: attempted ? attemptDetails : null
      };
    }));


    res.status(200).json({
      success: true,
      data: questionsWithAttemptStatus
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
exports.getAllCodingQuestions = async (req, res) => {
  try {
    const questions = await MainQuestionBank.find({ question_type: 'coding', isDeleted: false });
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
exports.getQuestionsWithUserResponse = async (req, res) => {
  try {
    // Get query parameters from the request
    const { module_code, topic_code, subtopic_code, question_type, level, question_category } = req.query;
    const userId = req.params.userId;

    // Create a filter object to build the query based on the optional parameters
    const filter = { isDeleted: false };

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
    if (level) {
      filter.level = level;
    }
    if (question_category) {
      if (question_category === 'tiy') {
        filter.isTIYQustion = true;
      } else if (question_category === 'questionBank') {
        filter.isQuestionBank = true;
      }
    }
    filter.isDeleted = false;
    // Fetch the skill assessments using the dynamic filter
    const questions = await MainQuestionBank.find(filter);
    const questionsWithAttemptStatus = await Promise.all(questions.map(async (question) => {
      const module = await NewModule.findOne({ module_code: question.module_code });
      let attempted = false;
      let attemptDetails = null;
      const userProgress = await UserMainQuestionBankProgress.findOne({
        moduleId: module._id,
        "progress.userId": userId
      });
      if (userProgress) {
        const userAttempt = userProgress.progress[0]?.answered_Questions.find(
          q => q.questionBankId === question._id.toString()
        );

        if (userAttempt) {
          attempted = true;
          attemptDetails = {
            answer: userAttempt.answer,
            finalResult: userAttempt.finalResult,
            output: userAttempt.output,
            choosen_option: userAttempt.choosen_option
          };
        }
      }


      return {
        ...question.toObject(),
        attempted,
        attemptDetails: attempted ? attemptDetails : null
      };
    }));

    // Check if any skill assessments are found
    if (!questions.length) {
      return res.status(404).json({ success: false, message: 'No Questions found' });
    }

    // Return the found skill assessments
    return res.status(200).json({
      success: true,
      data: questionsWithAttemptStatus,
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

exports.getAllQBQuestionByCAtegryId = async (req, res) => {
  try {
    const { category, userId } = req.params;
    const questionBankCategory = await QuestionBankCategory.findById(category);

    if (!questionBankCategory) {
      return res.status(404).json({ success: false, message: 'QuestionBankCategory not found' });
    }
    const questions = await MainQuestionBank.find({ isDeleted: false, questionbankCategoryRef: { $in: [category] }, isQuestionBank: true });
    const questionsWithAttemptStatus = await Promise.all(questions.map(async (question) => {
      const module = await NewModule.findOne({ module_code: question.module_code });
      let attempted = false;
      let attemptDetails = null;
      const userProgress = await UserMainQuestionBankProgress.findOne({
        moduleId: module._id,

      });
      let userSpecificProgress = null;
      if (userProgress) {
        userSpecificProgress =
          userProgress.progress.find(
            p => {
              return p.userId.equals(userId);
            }
          );
      }

      if (userSpecificProgress) {
        const userAttempt = userSpecificProgress?.answered_Questions.find(
          q => q.questionBankId === question._id.toString()
        );

        if (userAttempt) {
          attempted = true;
          attemptDetails = {
            answer: userAttempt.answer,
            finalResult: userAttempt.finalResult,
            output: userAttempt.output,
            choosen_option: userAttempt.choosen_option
          };
        }
      }


      return {
        ...question.toObject(),
        attempted,
        attemptDetails: attempted ? attemptDetails : null
      };
    }));
    res.status(200).json({ success: true, data: questionsWithAttemptStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
exports.getQuestionToAddCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const question = await MainQuestionBank.find({ isDeleted: false, isQuestionBank: true, questionbankCategoryRef: { $nin: [categoryId] } });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
exports.getAllQBQuestionByCAtegryIdWithUserResponse = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    // Get all questions with pagination and error handling
    const questions = await MainQuestionBank.find({ 
      isQuestionBank: true, 
      isDeleted: false 
    }).lean(); // Use lean() for better performance

    if (!questions || questions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No questions found' 
      });
    }

    // Process questions with user attempt status
    const questionsWithAttemptStatus = await Promise.all(
      questions.map(async (question) => {
        try {
          // Find module with error handling
          const module = await NewModule.findOne({ 
            module_code: question.module_code 
          }).select('_id').lean();

          if (!module) {
            console.warn(`Module not found for question ${question._id}`);
            return {
              ...question,
              attempted: false,
              attemptDetails: null,
              moduleError: 'Module not found'
            };
          }

          // Find user progress with error handling
          const userProgress = await UserMainQuestionBankProgress.findOne({
            moduleId: module._id
          }).lean();

          let attempted = false;
          let attemptDetails = null;
          let userSpecificProgress = null;

          if (userProgress) {
            userSpecificProgress = userProgress.progress.find(p => 
              p.userId && p.userId.equals(userId)
            );

            if (userSpecificProgress) {
              const userAttempt = userSpecificProgress.answered_Questions.find(
                q => q.questionBankId === question._id.toString()
              );

              if (userAttempt) {
                attempted = true;
                attemptDetails = {
                  answer: userAttempt.answer,
                  finalResult: userAttempt.finalResult,
                  output: userAttempt.output,
                  choosen_option: userAttempt.choosen_option
                };
              }
            }
          }

          return {
            ...question,
            attempted,
            attemptDetails: attempted ? attemptDetails : null
          };

        } catch (error) {
          console.error(`Error processing question ${question._id}:`, error);
          return {
            ...question,
            attempted: false,
            attemptDetails: null,
            processingError: 'Error loading attempt data'
          };
        }
      })
    );

    res.status(200).json({ 
      success: true, 
      data: questionsWithAttemptStatus 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message // Include error message for debugging
    });
  }
};

exports.getALLTIYQuestionsWithUserResponse = async (req, res) => {
  try {
    const { userId } = req.params
    const questions = await MainQuestionBank.find({ isTIYQustion: true, isDeleted: false });
    const questionsWithAttemptStatus = await Promise.all(questions.map(async (question) => {
      const module = await NewModule.findOne({ module_code: question.module_code });
      let attempted = false;
      let attemptDetails = null;
      const userProgress = await UserMainQuestionBankProgress.findOne({
        moduleId: module._id,
      });
      let userSpecificProgress = null;
      if (userProgress) {
        userSpecificProgress =
          userProgress.progress.find(
            p => {
              return p.userId.equals(userId);
            }
          );
      }

      if (userSpecificProgress) {
        const userAttempt = userSpecificProgress?.answered_Questions.find(
          q => q.questionBankId === question._id.toString()
        );

        if (userAttempt) {
          attempted = true;
          attemptDetails = {
            answer: userAttempt.answer,
            finalResult: userAttempt.finalResult,
            output: userAttempt.output,
            choosen_option: userAttempt.choosen_option
          };
        }
      }


      return {
        ...question.toObject(),
        attempted,
        attemptDetails: attempted ? attemptDetails : null
      };
    }));
    res.status(200).json({ success: true, data: questionsWithAttemptStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getNextLevelQuestion = async (req, res) => {
  try {
    const { questionId, isTIYQuestion, isQBQuestion } = req.body;
    let filter = {};
    if (isTIYQuestion) {
      filter.isTIYQustion = true;
    } else if (isQBQuestion) {
      filter.isQuestionBank = true;
    }
    filter.isDeleted = false;
    filter._id = questionId;

    const currentQuestion = await MainQuestionBank.findOne(filter);

    if (!currentQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    const { question_type, level, _id } = currentQuestion;

    let nextLevel;
    switch (level) {
      case 'easy': nextLevel = 'medium'; break;
      case 'medium':
      case 'hard':
      default: nextLevel = 'hard'; break;
    }
    let harderQuestionFilter = {};
    if (isTIYQuestion) {
      harderQuestionFilter.isTIYQustion = true;
    } else if (isQBQuestion) {
      harderQuestionFilter.isQuestionBank = true;
    }
    harderQuestionFilter.isDeleted = false;
    harderQuestionFilter.question_type = question_type;
    harderQuestionFilter.level = nextLevel;
    harderQuestionFilter._id = { $ne: _id };

    let harderQuestions = await MainQuestionBank.aggregate([
      { $match: { ...harderQuestionFilter, level: nextLevel } },
      { $sample: { size: 1 } }
    ]);
    harderQuestionFilter.level = level;
    if (!harderQuestions.length) {
      harderQuestions = await MainQuestionBank.aggregate([
        { $match: { ...harderQuestionFilter, level } },
        { $sample: { size: 1 } } // Random selection
      ]);
    }
    if (!harderQuestions.length) {
      return res.status(404).json({
        success: false,
        message: "No suitable question found"
      });
    }

    res.status(200).json({
      success: true,
      data: harderQuestions[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
exports.getAllTiyCodingQuestions = async (req, res) => {
  try {
    const questions = await MainQuestionBank.find({ isTIYQustion: true, question_type: 'coding', isDeleted: false });
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
exports.getAllQBCodingQuestions = async (req, res) => {
  try {
    const questions = await MainQuestionBank.find({ isQuestionBank: true, question_type: 'coding', isDeleted: false });
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
exports.getAllTiyCodingQuestionByModule = async (req, res) => {
  try {
    const { moduleCode } = req.params;
    const questions = await MainQuestionBank.find({ isTIYQustion: true, question_type: 'coding', isDeleted: false, module_code: moduleCode });
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
exports.getAllQBCodingQuestionsByModule = async (req, res) => {
  try {
    const { moduleCode } = req.params;
    const questions = await MainQuestionBank.find({ isQuestionBank: true, question_type: 'coding', isDeleted: false, module_code: moduleCode });
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
exports.getQuestionsByModuleCodeAdmin = async (req, res) => {
  try {
    const { question_category } = req.query
    const { module_code, } = req.params;
    let filter = {};
    if (question_category) {
      if (question_category === 'tiy') {
        filter.isTIYQustion = true;
      } else if (question_category === 'questionBank') {
        filter.isQuestionBank = true;
      }
    }
    filter.question_type = { $ne: 'coding' };
    filter.isDeleted = false;
    filter.module_code = module_code;
    const questions = await MainQuestionBank.find(filter);

    return res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getNextQuestion = async (req, res) => {
  try {
    const { questionId, categoryId } = req.body;
    let filter = {};
    if (categoryId) {
      filter.questionbankCategoryRef = { $in: [categoryId] };
    }
    console.log(filter);
    const questions = await MainQuestionBank.find({
      ...filter,
      isDeleted: false,
      isQuestionBank: true
    });
    const questionIndex = questions.findIndex((q) => {

      return q._id.toString() === questionId
    });
    console.log("questionIndex", questionIndex);
    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    let nextQuestion;
    if (questionIndex === questions.length - 1) {
      nextQuestion = questions[0];
    } else {
      nextQuestion = questions[questionIndex + 1];
    }
    if (nextQuestion._id.toString() === questionId) {
      return res.status(200).json({ success: false, message: 'No next question found' });
    }
    if (!nextQuestion) {
      return res.status(404).json({ success: false, message: 'No next question found' });
    }
    return res.status(200).json({ success: true, data: nextQuestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
exports.getNextTiyQuestions = async (req, res) => {
  try {
    // Get query parameters from the request
    const { questionId } = req.body;

    const currentQuestion = await MainQuestionBank.findById(questionId);
    if (!currentQuestion) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Create a filter object to build the query based on the optional parameters
    const filter = { isDeleted: false };


    filter.module_code = currentQuestion.module_code;


    filter.topic_code = currentQuestion.topic_code;



    // filter.question_type = currentQuestion.question_type;
    filter.isTIYQustion = true;

    filter.isDeleted = false;
    // Fetch the skill assessments using the dynamic filter
    const questions = await MainQuestionBank.find(filter);

    // Check if any skill assessments are found
    if (!questions.length) {
      return res.status(404).json({ success: false, message: 'No Questions found' });
    }

    const questionIndex = questions.findIndex((q) => {

      return q._id.toString() === questionId
    });
    console.log("questionIndex", questionIndex);
    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    let nextQuestion;
    if (questionIndex === questions.length - 1) {
      nextQuestion = questions[0];
    } else {
      nextQuestion = questions[questionIndex + 1];
    }
    if (nextQuestion._id.toString() === questionId) {
      return res.status(200).json({ success: false, message: 'No next question found' });
    }
    if (!nextQuestion) {
      return res.status(404).json({ success: false, message: 'No next question found' });
    }
    return res.status(200).json({ success: true, data: nextQuestion });

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
exports.getNextLevelTiyQuestion = async (req, res) => {
  try {
    const { questionId, isTIYQuestion, isQBQuestion } = req.body;

    let filter = {};
    if (isTIYQuestion) {
      filter.isTIYQustion = true;
    } else if (isQBQuestion) {
      filter.isQuestionBank = true;
    }
    filter.isDeleted = false;
    filter._id = questionId;

    const currentQuestion = await MainQuestionBank.findOne(filter);

    if (!currentQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    const { question_type, level, _id } = currentQuestion;

    let nextLevel;
    switch (level) {
      case 'easy': nextLevel = 'medium'; break;
      case 'medium':
      case 'hard':
      default: nextLevel = 'hard'; break;
    }
    let harderQuestionFilter = {};
    if (isTIYQuestion) {
      harderQuestionFilter.isTIYQustion = true;
    } else if (isQBQuestion) {
      harderQuestionFilter.isQuestionBank = true;
    }
    harderQuestionFilter.isDeleted = false;
    harderQuestionFilter.question_type = question_type;
    harderQuestionFilter.level = nextLevel;
    harderQuestionFilter._id = { $ne: _id };
    harderQuestionFilter.module_code = currentQuestion.module_code;
    harderQuestionFilter.topic_code = currentQuestion.topic_code;

    let harderQuestions = await MainQuestionBank.aggregate([
      { $match: { ...harderQuestionFilter, level: nextLevel } },
      { $sample: { size: 1 } }
    ]);
    harderQuestionFilter.level = level;
    if (!harderQuestions.length) {
      harderQuestions = await MainQuestionBank.aggregate([
        { $match: { ...harderQuestionFilter, level } },
        { $sample: { size: 1 } } // Random selection
      ]);
    }
    if (!harderQuestions.length) {
      return res.status(200).json({
        success: false,
        message: "No suitable question found"
      });
    }

    res.status(200).json({
      success: true,
      data: harderQuestions[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};