// controllers/topicController.js

const Topic = require("../Models/topicModel");

/**
 * @desc    Create a new Topic
 * @route   POST /api/topics
 * @access  Public (Adjust access as needed)
 */
exports.createTopic = async (req, res) => {
  try {
    const { topic_name, topic_description } = req.body;

    // Check if topic already exists
    let topic = await Topic.findOne({ topic_name });
    if (topic) {
      return res.status(400).json({
        success: false,
        message: "Topic already exists",
      });
    }

    // Create new Topic
    topic = new Topic({
      topic_name,
      topic_description,
    });

    await topic.save();

    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Get all Topics
 * @route   GET /api/topics
 * @access  Public (Adjust access as needed)
 */
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find();

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Get a Topic by ID
 * @route   GET /api/topics/:id
 * @access  Public (Adjust access as needed)
 */
exports.getTopicById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Topic ID",
      });
    }

    const topic = await Topic.findById(id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    console.error("Error fetching topic by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Update a Topic by ID
 * @route   PUT /api/topics/:id
 * @access  Public (Adjust access as needed)
 */
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic_name, topic_description } = req.body;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Topic ID",
      });
    }

    let topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    // Update fields if provided
    if (topic_name) topic.topic_name = topic_name;
    if (topic_description) topic.topic_description = topic_description;

    await topic.save();

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Delete a Topic by ID
 * @route   DELETE /api/topics/:id
 * @access  Public (Adjust access as needed)
 */
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Topic ID",
      });
    }

    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    await Topic.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
