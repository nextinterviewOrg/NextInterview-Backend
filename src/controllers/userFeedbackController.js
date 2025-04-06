const UserFeedback = require("../Models/userFeedbackModel");
const User = require("../Models/user-Model");

// Create a new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { userId, moduleId, rating, feedback } = req.body;

    // Validate required fields
    if (!userId || !moduleId || !rating || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if feedback already exists for this user and module
    const existingFeedback = await UserFeedback.findOne({ userId, moduleId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "Feedback has already been submitted for this module",
      });
    }

    // Create new feedback
    const newFeedback = new UserFeedback({
      userId,
      moduleId,
      rating,
      feedback,
    });

    // Save feedback
    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: newFeedback,
    });
  } catch (err) {
    console.error("Error creating feedback:", err);
    res.status(500).json({
      success: false,
      message: "Error submitting feedback",
      error: err.message,
    });
  }
};

// Get all feedback for a module
exports.getModuleFeedback = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Get all feedback for the module
    const feedback = await UserFeedback.find({ moduleId })
      .populate("userId", "user_name user_email")
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    console.error("Error getting module feedback:", err);
    res.status(500).json({
      success: false,
      message: "Error retrieving feedback",
      error: err.message,
    });
  }
};

// Get all feedback for a user
exports.getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all feedback from the user
    const feedback = await UserFeedback.find({ userId })
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    console.error("Error getting user feedback:", err);
    res.status(500).json({
      success: false,
      message: "Error retrieving feedback",
      error: err.message,
    });
  }
};

// Check if user has already submitted feedback for a specific module
exports.checkUserModuleFeedback = async (req, res) => {
  try {
    const { userId, moduleId } = req.params;

    // Check if feedback exists for this user and module
    const feedback = await UserFeedback.find({ userId, moduleId });

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    console.error("Error checking user module feedback:", err);
    res.status(500).json({
      success: false,
      message: "Error checking feedback",
      error: err.message,
    });
  }
};

// Get feedback statistics for a module
exports.getModuleFeedbackStats = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Get all feedback for the module
    const feedback = await UserFeedback.find({ moduleId });

    // Calculate statistics
    const totalFeedback = feedback.length;
    const averageRating = totalFeedback > 0
      ? feedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback
      : 0;

    // Count ratings
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    feedback.forEach((item) => {
      ratingCounts[item.rating]++;
    });

    res.status(200).json({
      success: true,
      data: {
        totalFeedback,
        averageRating,
        ratingCounts,
      },
    });
  } catch (err) {
    console.error("Error getting module feedback stats:", err);
    res.status(500).json({
      success: false,
      message: "Error retrieving feedback statistics",
      error: err.message,
    });
  }
};

// Delete feedback (admin only)
exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    // Find and delete the feedback
    const feedback = await UserFeedback.findByIdAndDelete(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting feedback:", err);
    res.status(500).json({
      success: false,
      message: "Error deleting feedback",
      error: err.message,
    });
  }
}; 