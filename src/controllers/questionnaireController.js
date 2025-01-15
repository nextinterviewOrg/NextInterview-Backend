// controllers/questionnaireController.js

const Questionnaire = require("../models/questionnaireModel");

/**
 * @desc    Create a new Questionnaire
 * @route   POST /api/questionnaires
 * @access  Public (Adjust access as needed)
 */
exports.createQuestionnaire = async (req, res) => {
  try {
    const {
      data_job_response,
      data_experience_response,
      user_id,
      data_scheduled_interview_response,
      data_interview_schedule_response,
      data_interview_scheduled_response,
      data_past_interview_response,
      data_motive_response,
    } = req.body;

    // Validate required fields
    if (
      !data_job_response ||
      !data_experience_response ||
      !user_id ||
      !data_interview_schedule_response ||
      !data_interview_scheduled_response ||
      !data_motive_response
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Create new Questionnaire
    const newQuestionnaire = await Questionnaire.create({
      data_job_response,
      data_experience_response,
      user_id,
      data_scheduled_interview_response,
      data_interview_schedule_response,
      data_interview_scheduled_response,
      data_past_interview_response,
      data_motive_response,
    });

    res.status(201).json({
      success: true,
      data: newQuestionnaire,
    });
  } catch (error) {
    console.error("Error creating questionnaire:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Get all Questionnaires
 * @route   GET /api/questionnaires
 * @access  Public (Adjust access as needed)
 */
exports.getAllQuestionnaires = async (req, res) => {
  try {
    const questionnaires = await Questionnaire.find()
      .populate("data_job_response")
      .populate("user_id")
      .populate("data_interview_schedule_response.company")
      .populate("data_interview_schedule_response.designation")
      .populate("data_interview_scheduled_response.company")
      .populate("data_interview_scheduled_response.designation")
      .populate({
        path: "data_past_interview_response.company_Name",
        model: "CompanyData",
      })
      .populate("data_past_interview_response.designation")
      .populate("data_past_interview_response.topics");

    res.status(200).json({
      success: true,
      count: questionnaires.length,
      data: questionnaires,
    });
  } catch (error) {
    console.error("Error fetching questionnaires:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Get a Questionnaire by ID
 * @route   GET /api/questionnaires/:id
 * @access  Public (Adjust access as needed)
 */
exports.getQuestionnaireById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Questionnaire ID",
      });
    }

    const questionnaire = await Questionnaire.findById(id)
      .populate("data_job_response")
      .populate("user_id")
      .populate("data_interview_schedule_response.company")
      .populate("data_interview_schedule_response.designation")
      .populate("data_interview_scheduled_response.company")
      .populate("data_interview_scheduled_response.designation")
      .populate({
        path: "data_past_interview_response.company_Name",
        model: "CompanyData",
      })
      .populate("data_past_interview_response.designation")
      .populate("data_past_interview_response.topics");

    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        message: "Questionnaire not found",
      });
    }

    res.status(200).json({
      success: true,
      data: questionnaire,
    });
  } catch (error) {
    console.error("Error fetching questionnaire by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Get Questionnaires by User ID
 * @route   GET /api/questionnaires/user/:userId
 * @access  Public (Adjust access as needed)
 */
exports.getQuestionnairesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const questionnaires = await Questionnaire.find({ user_id: userId })
      .populate("data_job_response")
      .populate("user_id")
      .populate("data_interview_schedule_response.company")
      .populate("data_interview_schedule_response.designation")
      .populate("data_interview_scheduled_response.company")
      .populate("data_interview_scheduled_response.designation")
      .populate({
        path: "data_past_interview_response.company_Name",
        model: "CompanyData",
      })
      .populate("data_past_interview_response.designation")
      .populate("data_past_interview_response.topics");

    res.status(200).json({
      success: true,
      count: questionnaires.length,
      data: questionnaires,
    });
  } catch (error) {
    console.error("Error fetching questionnaires by User ID:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Update a Questionnaire by ID
 * @route   PUT /api/questionnaires/:id
 * @access  Public (Adjust access as needed)
 */
exports.updateQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Questionnaire ID",
      });
    }

    let questionnaire = await Questionnaire.findById(id);
    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        message: "Questionnaire not found",
      });
    }

    // Update fields
    const updateFields = req.body;
    questionnaire = await Questionnaire.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    })
      .populate("data_job_response")
      .populate("user_id")
      .populate("data_interview_schedule_response.company")
      .populate("data_interview_schedule_response.designation")
      .populate("data_interview_scheduled_response.company")
      .populate("data_interview_scheduled_response.designation")
      .populate({
        path: "data_past_interview_response.company_Name",
        model: "CompanyData",
      })
      .populate("data_past_interview_response.designation")
      .populate("data_past_interview_response.topics");

    res.status(200).json({
      success: true,
      data: questionnaire,
    });
  } catch (error) {
    console.error("Error updating questionnaire:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Delete a Questionnaire by ID
 * @route   DELETE /api/questionnaires/:id
 * @access  Public (Adjust access as needed)
 */
exports.deleteQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Questionnaire ID",
      });
    }

    const questionnaire = await Questionnaire.findById(id);
    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        message: "Questionnaire not found",
      });
    }

    await Questionnaire.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Questionnaire deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting questionnaire:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
