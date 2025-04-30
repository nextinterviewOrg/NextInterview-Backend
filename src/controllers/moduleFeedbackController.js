const ModuleFeedback = require("../Models/moduleFeedbackModel");
const User = require("../Models/user-Model");
const NewModule = require("../Models/addNewModuleModel");


exports.addModuleFeedback = async (req, res) => {
    try {
        const { moduleId, userId, feedback, rating, feedback_order } = req.body;
        if (!moduleId || !userId || !feedback || !rating || !feedback_order) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const module = await NewModule.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        if (feedback_order == 1) {
            const moduleFeedback = await ModuleFeedback.findOne({ moduleId });
            if (moduleFeedback) {
                if (moduleFeedback.feedback_one.some((element) => element.userId == userId)) {
                    moduleFeedback.feedback_one.some((element) => {
                        if (element.userId == userId) {
                            element.rating = rating;
                            element.feedback = feedback;
                        }
                    })
                    const newFeedback = await moduleFeedback.save();
                    return res.status(200).json({ sucess: true, message: "Feedback updated successfully", data: newFeedback });
                } else {
                    const newFeedback = await ModuleFeedback.updateOne({ moduleId }, { $push: { feedback_one: { userId: userId, rating: rating, feedback: feedback } } });
                    return res.status(200).json({ sucess: true, message: "Feedback added successfully", data: newFeedback });
                }
            } else {
                const newFeedback = await ModuleFeedback.create({ moduleId, feedback_one: [{ userId: userId, rating: rating, feedback: feedback }] });
                return res.status(200).json({ sucess: true, message: "Feedback added successfully", data: newFeedback });
            }
        } else if (feedback_order == 2) {
            const moduleFeedback = await ModuleFeedback.findOne({ moduleId });
            if (moduleFeedback) {
                if (moduleFeedback.feedback_two.some((element) => element.userId == userId)) {
                    moduleFeedback.feedback_two.some((element) => {
                        if (element.userId == userId) {
                            element.rating = rating;
                            element.feedback = feedback;
                        }
                    })
                    const newFeedback = await moduleFeedback.save();
                    return res.status(200).json({ sucess: true, message: "Feedback updated successfully", data: newFeedback });
                } else {
                    const newFeedback = await ModuleFeedback.updateOne({ moduleId }, { $push: { feedback_two: { userId: userId, rating: rating, feedback: feedback } } });
                    return res.status(200).json({ sucess: true, message: "Feedback added successfully", data: newFeedback });
                }
            } else {
                const newFeedback = await ModuleFeedback.create({ moduleId, feedback_two: [{ userId: userId, rating: rating, feedback: feedback }] });
                return res.status(200).json({ sucess: true, message: "Feedback added successfully", data: newFeedback });
            }
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({sucess:false, message: "Error adding feedback", error: error.message });
    }
};

exports.getModuleFeedback = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const moduleFeedback = await ModuleFeedback.findOne({ moduleId });
        if (!moduleFeedback) {
            return res.status(404).json({ message: "Module feedback not found" });
        }
        return res.status(200).json({ sucess: true, data: moduleFeedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({sucess:false, message: "Error getting module feedback", error: error.message });
    }
};
exports.getAllModuleFeedback = async (req, res) => {
    try {
        const moduleFeedback = await ModuleFeedback.find();
        if (!moduleFeedback) {
            return res.status(404).json({ message: "Module feedback not found" });
        }
        return res.status(200).json({ sucess: true, data: moduleFeedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({sucess:false, message: "Error getting module feedback", error: error.message });
    }
};

exports.getUserFeedbackCheck = async (req, res) => {
    try {
        const { userId,feedback_order,moduleId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const module = await NewModule.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }
        const moduleFeedback = await ModuleFeedback.findOne({ moduleId });
        if (!moduleFeedback) {
            return res.status(200).json({ sucess: true,found: false, message: "User feedback not found" });
        }
        if (feedback_order == 1) {
            if( moduleFeedback.feedback_one.some((element) => element.userId == userId)) {
                moduleFeedback.feedback_one.some((element) => {
                    if (element.userId == userId) {
                        return res.status(200).json({ sucess: true, found: true, data: element });
                    } 
                })
            }else{
                return res.status(200).json({ sucess: true,found: false, message: "User feedback not found" });
            }
        } else if (feedback_order == 2) {
            if( moduleFeedback.feedback_two.some((element) => element.userId == userId)) {
                moduleFeedback.feedback_two.some((element) => {
                    if (element.userId == userId) {
                        return res.status(200).json({ sucess: true, found: true, data: element });
                    } 
                })
            }else{
                return res.status(200).json({ sucess: true,found: false, message: "User feedback not found" });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({sucess:false, message: "Error getting user feedback", error: error.message });
    }
};


