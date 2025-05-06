const mongoose = require('mongoose');
const SampleInterviewFeedback = require('../Models/SampleInterviewFeedbackModel');
const ObjectId = mongoose.Types.ObjectId;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create feedback controller
const createFeedback = async (req, res) => {
    try {
        const { moduleId, userId, feedback, helpfull,skip = false } = req.body;

        if (!isValidObjectId(moduleId) || !isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        if (!feedback && !skip) {
            return res.status(400).json({
                message: "Either feedback text or skip must be provided"
            });
        }

        const moduleFeedback = await SampleInterviewFeedback.findOne({ moduleId });
        if (!moduleFeedback) {
            const newModuleFeedback = new SampleInterviewFeedback({
                moduleId,
                feedback: [
                    {
                        userId: new ObjectId(userId),
                        feedback: !skip ? feedback : null,
                        helpfull,
                        skip
                    }
                ]
            });
            const savedModuleFeedback = await newModuleFeedback.save();
            return res.status(201).json({ success: true, message: "Feedback created successfully", data: savedModuleFeedback });
        }
        const userFeedback = moduleFeedback.feedback.find(f => f.userId.equals(userId));
        if (userFeedback) {
            return res.status(200).json({
                message: "User has already submitted feedback for this module"
            });
        }
        const result = await SampleInterviewFeedback.findOneAndUpdate(
            {
                moduleId,
                "feedback.userId": { $ne: new ObjectId(userId) }
            },
            {
                $push: {
                    feedback: {
                        userId: new ObjectId(userId),
                        feedback: !skip ? feedback : null,
                        helpfull,
                        skip
                    }
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        if (!result) {
            return res.status(200).json({
                message: "User has already submitted feedback for this module"
            });
        }

        res.status(201).json({ success: true, message: "Feedback created successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all feedbacks
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await SampleInterviewFeedback.find()
            .populate('moduleId')
            .populate('feedback.userId'); // Add required user fields

        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get feedback by module ID
const getFeedbackByModuleId = async (req, res) => {
    try {
        const { moduleId } = req.params;

        if (!isValidObjectId(moduleId)) {
            return res.status(400).json({ message: "Invalid module ID format" });
        }

        const feedback = await SampleInterviewFeedback.findOne({ moduleId })
            .populate('moduleId')
            .populate('feedback.userId');

        if (!feedback) {
            return res.status(404).json({ message: "Module feedback not found" });
        }

        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check user feedback status
const checkUserFeedbackStatus = async (req, res) => {
    try {
        const { moduleId, userId } = req.body;
        console.log(req.body);

        if (!isValidObjectId(moduleId) || !isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const feedbackDoc = await SampleInterviewFeedback.findOne({
            moduleId,
            "feedback.userId": new ObjectId(userId)
        });

        if (!feedbackDoc) {
            return res.status(200).json({
                submitted: false,
                message:"feedback needs to be submitted"
            });
        }

        const userFeedback = feedbackDoc.feedback.find(f =>
            f.userId.equals(new ObjectId(userId))
        );

        res.status(200).json({
            submitted: !!userFeedback.feedback || userFeedback.skip,
            message: (!!userFeedback.feedback || userFeedback.skip) ? "Feedback already submitted" : " feedback needs to be submitted"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createFeedback,
    getAllFeedbacks,
    getFeedbackByModuleId,
    checkUserFeedbackStatus
};