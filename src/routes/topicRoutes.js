// routes/topicRoutes.js

const express = require("express");
const router = express.Router();
const {
  createTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
} = require("../controllers/topicController");

// Optional: Import authentication middleware if routes should be protected
// const { protect } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/topics
 * @desc    Create a new Topic
 * @access  Public (Adjust access as needed)
 */
router.post("/", createTopic);

/**
 * @route   GET /api/topics
 * @desc    Get all Topics
 * @access  Public (Adjust access as needed)
 */
router.get("/", getAllTopics);

/**
 * @route   GET /api/topics/:id
 * @desc    Get a Topic by ID
 * @access  Public (Adjust access as needed)
 */
router.get("/:id", getTopicById);

/**
 * @route   PUT /api/topics/:id
 * @desc    Update a Topic by ID
 * @access  Public (Adjust access as needed)
 */
router.put("/:id", updateTopic);

/**
 * @route   DELETE /api/topics/:id
 * @desc    Delete a Topic by ID
 * @access  Public (Adjust access as needed)
 */
router.delete("/:id", deleteTopic);

module.exports = router;
