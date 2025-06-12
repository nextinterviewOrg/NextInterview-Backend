const UserChallenges = require("../Models/userChallengesModel");
const UserChallengesProgress = require("../Models/userChallengesProgresModel");
const mongoose = require("mongoose");

// Create a new challenge
exports.createChallenge = async (req, res) => {
  try {
    const {
      programming_language,
      QuestionText,
      question_type,
      description,
      input,
      output,
      difficulty,
      hints = [],
      base_code,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      answer,
      challenge_date,
      topics = [],
      dbSetupCommands,
      solutionCode,
      solutionExplanation
    } = req.body;

    // Validate required fields
    if (
      !QuestionText || !question_type
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    if (hints && Array.isArray(hints)) {
      for (const hint of hints) {
        if (!hint.hint_text) {
          return res.status(400).json({
            success: false,
            message: "Each hint must have at least a hint_text field"
          });
        }
      }
    }
    switch (question_type) {
      case 'mcq':
        if (!option_a || !option_b || !option_c || !option_d || !correct_option) {
          return res.status(400).json({
            success: false,
            message: "For MCQ type, all options (a-d) and correct_option are required"
          });
        }
        break;

      case 'single-line':
        if (!answer) {
          return res.status(400).json({
            success: false,
            message: `For ${question_type} type, answer is required`
          });
        }
        break;
      case 'multi-line':
        if (!answer) {
          return res.status(400).json({
            success: false,
            message: `For ${question_type} type, answer is required`
          });
        }
        break;
      case 'coding':
        if (question_type === 'coding' && !base_code) {
          return res.status(400).json({
            success: false,
            message: "For coding type, base_code is required"
          });
        }
        if (question_type === 'coding' && !topics) {
          return res.status(400).json({
            success: false,
            message: "For coding type, topics are required"
          });
        }
        break;

      case 'approach':

      case 'case-study':
        // Only QuestionText is required (already validated above)
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid question type"
        });
    }

    switch (question_type) {
      case 'mcq':
        const newChallenge_mcq = new UserChallenges({
          question_type,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          QuestionText,
          challenge_date
        });

        const savedChallenge_mcq = await newChallenge_mcq.save();
        res.status(201).json({
          success: true,
          message: "Challenge created successfully",
          data: savedChallenge_mcq
        })
        break;

      case 'single-line':
        const newChallenge_singleline = new UserChallenges({
          question_type,
          QuestionText,
          answer,
          challenge_date
        });

        const savedChallenge_singleline = await newChallenge_singleline.save();
        res.status(201).json({
          success: true,
          message: "Challenge created successfully",
          data: savedChallenge_singleline
        })
        break;
      case 'multi-line':
        const newChallenge_multiline = new UserChallenges({
          question_type,
          QuestionText,
          challenge_date,
          answer
        });

        const savedChallenge_multiline = await newChallenge_multiline.save();
        res.status(201).json({
          success: true,
          message: "Challenge created successfully",
          data: savedChallenge_multiline
        });
        break;
      case 'coding':
        const newChallenge = new UserChallenges({
          question_type,
          programming_language,
          QuestionText,
          description,
          input,
          output,
          difficulty,
          topics,
          hints,
          challenge_date,
          base_code,
          dbSetupCommands,
          solutionCode,
          solutionExplanation
        });
        const savedChallenge = await newChallenge.save();
        res.status(201).json({
          success: true,
          message: "Challenge created successfully",
          data: savedChallenge
        });
        break;

      case 'approach':
        const newChallenge_approach = new UserChallenges({
          question_type,
          QuestionText,
          challenge_date
        });

        const savedChallenge_approach = await newChallenge_approach.save();
        res.status(201).json({
          success: true,
          message: "Challenge created successfully",
          data: savedChallenge_approach
        })
        break;
      case 'case-study':
        const newChallenge_caseStudy = new UserChallenges({
          question_type,
          QuestionText,
          challenge_date
        });

        const savedChallenge_caseStudy = await newChallenge_caseStudy.save();
        res.status(201).json({
          success: true,
          message: "Challenge created successfully",
          data: savedChallenge_caseStudy
        })
        // No additional fields needed
        break;
    }

    // const newChallenge = new UserChallenges({
    //   programming_language,
    //   QuestionText,
    //   description,
    //   input,
    //   output,
    //   difficulty,
    //   hints
    // });

    // const savedChallenge = await newChallenge.save();
    // res.status(201).json({
    //   success: true,
    //   message: "Challenge created successfully",
    //   data: savedChallenge
    // });
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating challenge",
      error: error.message
    });
  }
};

// Get all challenges
exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await UserChallenges.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Challenges retrieved successfully",
      data: challenges
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching challenges",
      error: error.message
    });
  }
};

// Get a single challenge by ID
exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await UserChallenges.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Challenge retrieved successfully",
      data: challenge
    });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching challenge",
      error: error.message
    });
  }
};

// Update a challenge
exports.updateChallenge = async (req, res) => {
  try {
    const {
      programming_language,
      QuestionText,
      question_type,
      description,
      input,
      output,
      difficulty,
      hints = [],
      topics = [],
      base_code,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      answer,
      isDeleted,
      dbSetupCommands,
      solutionCode,
      solutionExplanation
    } = req.body;

    const updateData = {
      programming_language,
      QuestionText,
      question_type,
      description,
      input,
      output,
      difficulty,
      hints,
      topics,
      base_code,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      answer,
      isDeleted,
      dbSetupCommands,
      solutionCode,
      solutionExplanation
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedChallenge = await UserChallenges.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
        context: 'query' // Ensures validators run with the correct this context
      }
    );

    if (!updatedChallenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Challenge updated successfully",
      data: updatedChallenge
    });
  } catch (error) {
    console.error("Error updating challenge:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating challenge",
      error: error.message
    });
  }
};

// Delete a challenge
exports.deleteChallenge = async (req, res) => {
  try {
    const deletedChallenge = await UserChallenges.findByIdAndDelete(
      req.params.id
    );
    if (!deletedChallenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Challenge deleted successfully",
      data: deletedChallenge
    });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting challenge",
      error: error.message
    });
  }
};

exports.getTodaysChallengesWithStatus = async (req, res) => {
  try {
    const { question_type } = req.query;
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Get today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's challenges
    const todaysChallenges = await UserChallenges.find({
      challenge_date: {
        $gte: today,
        $lt: tomorrow
      },
      // question_type
    });

    if (todaysChallenges.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No challenges found for today",
        data: []
      });
    }

    // Get all question IDs for today's challenges
    const questionIds = todaysChallenges.map(challenge => challenge._id);

    // Get user progress for these questions
    const userProgress = await UserChallengesProgress.find({
      questionId: { $in: questionIds },
      "progress.userId": userId
    });
    // Create a map of questionId to user progress for quick lookup
    const progressMap = new Map();
    userProgress.forEach(doc => {
      const userProg = doc.progress.find(p => p.userId.toString() === userId.toString());
      if (userProg) {
        progressMap.set(doc.questionId.toString(), {
          status: userProg.skip ? "skipped" :
            userProg.answer ? "answered" : "attempted",
          answer: userProg.answer,
          finalResult: userProg.finalResult,
          timestamp: userProg.timestamp
        });
      }
    });

    // Combine challenge data with user status
    const challengesWithStatus = todaysChallenges.map(challenge => {
      const progress = progressMap.get(challenge._id.toString());
      return {
        ...challenge.toObject(),
        userStatus: progress ? progress.status : "not attempted",
        answer: progress ? progress.answer : null,
        finalResult: progress ? progress.finalResult : null,
        lastAttempted: progress ? progress.timestamp : null
      };
    });

    res.status(200).json({
      success: true,
      message: "Today's challenges with user status retrieved successfully",
      data: challengesWithStatus
    });

  } catch (error) {
    console.error("Error getting today's challenges:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving today's challenges",
      error: error.message
    });
  }
};

exports.getAllChallengesWithUserResults = async (req, res) => {
  try {
    const { question_type } = req.query;
    const { userId } = req.params;
    console.log("userId", userId, "question_type", question_type);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Get all challenges
    const allChallenges = await UserChallenges.find({ question_type: question_type }).sort({ uploaded_date: -1 });

    // Get all question IDs
    const questionIds = allChallenges.map(challenge => challenge._id);
    console.log("questionIds", questionIds);

    // Get user progress for these questions
    const userProgress = await UserChallengesProgress.find({
      questionId: { $in: questionIds },
      "progress.userId": userId,
    });


    // Create a progress map for quick lookup
    const progressMap = new Map();
    userProgress.forEach(doc => {
      const userProg = doc.progress.find(p => p.userId.toString() === userId.toString());
      if (userProg) {
        progressMap.set(doc.questionId.toString(), {
          status: userProg.skip ? "skipped" :
            userProg.answer ? "attempted" : "viewed",
          answer: userProg.answer,
          isCorrect: userProg.finalResult,
          timestamp: userProg.timestamp
        });
      }
    });

    // Combine challenge data with user results
    const challengesWithResults = allChallenges.map(challenge => {
      const progress = progressMap.get(challenge._id.toString());

      return {
        challengeId: challenge._id,
        programming_language: challenge.programming_language,
        questionText: challenge.QuestionText,
        description: challenge.description,
        difficulty: challenge.difficulty,
        userStatus: progress ? progress.status : "not attempted",
        isCorrect: progress ? progress.isCorrect : null,
        lastAttempted: progress ? progress.timestamp : null,
        hints: challenge.hints
      };
    });

    res.status(200).json({
      success: true,
      message: "All challenges with user results retrieved successfully",
      data: challengesWithResults
    });

  } catch (error) {
    console.error("Error getting challenges with user results:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving challenges with user results",
      error: error.message
    });
  }
};
exports.getAllPastChallengesWithUserResults = async (req, res) => {
  try {
    const { question_type } = req.query;
    const { userId } = req.params;
    console.log("userId", userId, "question_type", question_type);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Get all challenges
    const allChallenges = await UserChallenges.find({ challenge_date: { $lt: today } }).sort({ uploaded_date: -1 });

    // Get all question IDs
    const questionIds = allChallenges.map(challenge => challenge._id);


    // Get user progress for these questions
    const userProgress = await UserChallengesProgress.find({
      questionId: { $in: questionIds },
      "progress.userId": userId,
    });


    // Create a progress map for quick lookup
    const progressMap = new Map();
    userProgress.forEach(doc => {
      const userProg = doc.progress.find(p => p.userId.toString() === userId.toString());
      if (userProg) {
        progressMap.set(doc.questionId.toString(), {
          status: userProg.skip ? "skipped" :
            userProg.answer ? "attempted" : "viewed",
          answer: userProg.answer,
          isCorrect: userProg.finalResult,
          timestamp: userProg.timestamp
        });
      }
    });

    // Combine challenge data with user results
    const challengesWithResults = allChallenges.map(challenge => {
      const progress = progressMap.get(challenge._id.toString());

      return {
        challengeId: challenge._id,
        programming_language: challenge.programming_language,
        questionText: challenge.QuestionText,
        description: challenge.description,
        difficulty: challenge.difficulty,
        challenge_date: challenge.challenge_date,
        question_type: challenge.question_type,
        userStatus: progress ? progress.status : "not attempted",
        isCorrect: progress ? progress.isCorrect : null,
        lastAttempted: progress ? progress.timestamp : null,
        hints: challenge.hints
      };
    });

    res.status(200).json({
      success: true,
      message: "All challenges with user results retrieved successfully",
      data: challengesWithResults
    });

  } catch (error) {
    console.error("Error getting challenges with user results:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving challenges with user results",
      error: error.message
    });
  }
};