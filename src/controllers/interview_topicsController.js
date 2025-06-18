const Interview_topics = require("../Models/interview_topicModel");
const mongoose = require("mongoose");


exports.getAllTopics = async (req, res) => {
        try {
            const topics = await Interview_topics.find();
    
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