const UserChallenges = require("../Models/userChallengesModel");
const UserChallengesProgress = require("../Models/userChallengesProgresModel");
const mongoose = require("mongoose");

// Helper function to get the next serial number with robust error handling
const getNextSerialNo = async () => {
  try {
    const latest = await UserChallenges.findOne()
      .sort({ serialNo: -1 })
      .select("serialNo")
      .lean();
    
    // If no documents exist, start with 1
    if (!latest || !latest.serialNo) {
      return 1;
    }
    
    // Ensure the serialNo is a valid number
    const nextSerial = parseInt(latest.serialNo, 10);
    
    if (isNaN(nextSerial)) {
      // If existing serialNo is invalid, start fresh
      return 1;
    }
    
    return nextSerial + 1;
  } catch (error) {
    console.error("Error getting next serial number:", error);
    // Fallback to 1 if there's any error
    return 1;
  }
};

// Create a new challenge
exports.createChallenge = async (req, res) => {
  try {
    // Get the next serial number first
    const nextSerialNo = await getNextSerialNo();
    
    // Ensure we have a valid number
    if (isNaN(nextSerialNo)) {
      throw new Error("Failed to generate a valid serial number");
    }

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

    if (!QuestionText || !question_type) {
      return res.status(400).json({
        success: false,
        message: "Question text and type are required"
      });
    }

    // Validate hints array if provided
    if (hints && Array.isArray(hints)) {
      for (const hint of hints) {
        if (!hint.hint_text) {
          return res.status(400).json({
            success: false,
            message: "Each hint must have a hint_text field"
          });
        }
      }
    }

    // Validate based on question type
    let validationError;
    switch (question_type) {
      case 'mcq':
        if (!option_a || !option_b || !option_c || !option_d || !correct_option) {
          validationError = "For MCQ type, all options (a-d) and correct_option are required";
        }
        break;
      case 'single-line':
      case 'multi-line':
        if (!answer) {
          validationError = `For ${question_type} type, answer is required`;
        }
        break;
      case 'coding':
        if (!base_code) validationError = "For coding type, base_code is required";
        if (!topics || topics.length === 0) validationError = "For coding type, topics are required";
        break;
      case 'approach':
      case 'case-study':
        // No additional validation needed
        break;
      default:
        validationError = "Invalid question type";
    }

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // Create the challenge object with the serial number
    const challengeData = {
      serialNo: Number(nextSerialNo), // Explicitly convert to Number
      question_type,
      QuestionText,
      description,
      challenge_date: challenge_date || new Date(),
      ...(question_type === 'mcq' && {
        option_a, option_b, option_c, option_d, correct_option
      }),
      ...(['single-line', 'multi-line', 'approach', 'case-study'].includes(question_type) && {
        answer
      }),
      ...(question_type === 'coding' && {
        programming_language,
        input,
        output,
        difficulty,
        hints,
        topics,
        base_code,
        dbSetupCommands,
        solutionCode,
        solutionExplanation
      })
    };
    console.log( "challengeData", challengeData);

    // Create and save the new challenge
    const newChallenge = new UserChallenges(challengeData);
    const savedChallenge = await newChallenge.save();

    res.status(201).json({
      success: true,
      message: "Challenge created successfully",
      data: savedChallenge
    });

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
const challenges = await UserChallenges.find({ isDeleted: { $ne: true } }).sort({ serialNo: 1 });
    res.status(200).json({ data: challenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ message: "Server error" });
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
      solutionExplanation,
      challenge_date
    } = req.body;

       if (challenge_date && isNaN(Date.parse(challenge_date))) {
      return res.status(400).json({
        success: false,
        message: "Invalid challenge_date format. Please use a valid ISO date string (e.g. 2025-07-22T00:00:00.000Z)."
      });
    }

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
      solutionExplanation,
      challenge_date
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
        context: 'query'
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

// Delete challenge
exports.deleteChallenge = async (req, res) => {
  try {
    const challengeToDelete = await UserChallenges.findById(req.params.id);
    if (!challengeToDelete) return res.status(404).json({ success: false, message: "Challenge not found" });

    const deletedSerialNo = challengeToDelete.serialNo;
    await challengeToDelete.deleteOne();

    // Update serial numbers of remaining challenges
    await UserChallenges.updateMany(
      { serialNo: { $gt: deletedSerialNo } },
      { $inc: { serialNo: -1 } }
    );

    res.status(200).json({ success: true, message: "Challenge deleted and serial numbers updated", data: challengeToDelete });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    res.status(500).json({ success: false, message: "Server error while deleting challenge", error: error.message });
  }
};

// One-time migration to assign serial numbers to existing documents
exports.assignSerialNumbers = async (req, res) => {
  try {
    const challenges = await UserChallenges.find().sort({ uploaded_date: 1 });
    for (let i = 0; i < challenges.length; i++) {
      challenges[i].serialNo = i + 1;
      await challenges[i].save();
    }
    res.status(200).json({ message: "Serial numbers assigned successfully." });
  } catch (error) {
    console.error("Error assigning serial numbers:", error);
    res.status(500).json({ message: "Server error during serial number assignment." });
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
       isDeleted: { $ne: true },
      challenge_date: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ serialNo: 1 }); // Optional: sort by serialNo

    if (todaysChallenges.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No challenges found for today",
        data: []
      });
    }

    const questionIds = todaysChallenges.map(challenge => challenge._id);

    const userProgress = await UserChallengesProgress.find({
      questionId: { $in: questionIds },
      "progress.userId": userId
    });

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

    const challengesWithStatus = todaysChallenges.map(challenge => {
      const progress = progressMap.get(challenge._id.toString());
      return {
        _id: challenge._id,
        serialNo: challenge.serialNo, // explicitly including serialNo
        QuestionText: challenge.QuestionText,
        programming_language: challenge.programming_language,
        description: challenge.description,
        input: challenge.input,
        output: challenge.output,
        challenge_date: challenge.challenge_date,
        userStatus: progress ? progress.status : "not attempted",
        answer: progress ? progress.answer : null,
        finalResult: progress ? progress.finalResult : null,
        lastAttempted: progress ? progress.timestamp : null,
        topics: challenge.topics
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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Get all challenges
const allChallenges = await UserChallenges.find({
  isDeleted: { $ne: true },
  question_type: question_type
}).sort({ uploaded_date: -1 });

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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Get all challenges
const allChallenges = await UserChallenges.find({
  isDeleted: { $ne: true },
  challenge_date: { $lt: today }
}).sort({ uploaded_date: -1 });

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

exports.getTodaysChallengesWithNextQuestion = async (req, res) => {
  try {
    const { question_type } = req.query;
    const { userId, questionId } = req.params;

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
      }
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
    
    const questionIndex = challengesWithStatus.findIndex((q) => q._id.toString() === questionId);
    let nextQuestion = null;
    if (questionIndex !== -1) {
      if (questionIndex === challengesWithStatus.length - 1) {
        nextQuestion = challengesWithStatus[0];
      } else {
        nextQuestion = challengesWithStatus[questionIndex + 1];
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Today's challenges with user status retrieved successfully",
      nextQuestion: nextQuestion
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

exports.getAllPastChallengesNextQuestion = async (req, res) => {
  try {
    const { question_type } = req.query;
    const { userId, questionId } = req.params;

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
    
    const questionIndex = challengesWithResults.findIndex((q) => q.challengeId.toString() === questionId);
    let nextQuestion = null;
    if (questionIndex !== -1) {
      if (questionIndex === challengesWithResults.length - 1) {
        nextQuestion = challengesWithResults[0];
      } else {
        nextQuestion = challengesWithResults[questionIndex + 1];
      }
    }

    res.status(200).json({
      success: true,
      message: "All challenges with user results retrieved successfully",
      nextQuestion: nextQuestion
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

exports.softdeleteChallenge = async (req, res) => {
  try {
    const challengeToDelete = await UserChallenges.findById(req.params.id);

    if (!challengeToDelete)
      return res.status(404).json({ success: false, message: "Challenge not found" });

    const deletedSerialNo = challengeToDelete.serialNo;

    // Soft delete
    challengeToDelete.isDeleted = true;
    challengeToDelete.deletedAt = new Date();
    await challengeToDelete.save();

    // Update serial numbers of remaining active challenges
    await UserChallenges.updateMany(
      { serialNo: { $gt: deletedSerialNo }, isDeleted: false },
      { $inc: { serialNo: -1 } }
    );

    res.status(200).json({
      success: true,
      message: "Challenge soft-deleted and serial numbers updated",
      data: challengeToDelete
    });
  } catch (error) {
    console.error("Error soft-deleting challenge:", error);
    res.status(500).json({
      success: false,
      message: "Server error while soft-deleting challenge",
      error: error.message,
    });
  }
};
