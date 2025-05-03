const ModuleFeedback = require("../Models/moduleFeedbackModel");
const User = require("../Models/user-Model");
const NewModule = require("../Models/addNewModuleModel");


exports.addModuleFeedback = async (req, res) => {
    try {
        const { moduleId, userId, feedback, rating, feedback_order, skip } = req.body;
        if (skip == false) {
            if (!moduleId || !userId || !feedback || !rating || !feedback_order) {
                return res.status(400).json({ message: "Missing required fields" });
            }
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
                if (skip == true) {
                    const newFeedback = await ModuleFeedback.create({ moduleId, feedback_one: [{ userId: userId, skip: true }] });
                    return res.status(200).json({ sucess: true, message: "Feedback added successfully", data: newFeedback });
                } else {
                    const newFeedback = await ModuleFeedback.create({ moduleId, feedback_one: [{ userId: userId, rating: rating, feedback: feedback }] });
                    return res.status(200).json({ sucess: true, message: "Feedback added successfully", data: newFeedback });
                }

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
                if (skip == true) {
                    const newFeedback = await ModuleFeedback.create({ moduleId, feedback_two: [{ userId: userId, skip: true }] });
                    return res.status(200).json({ sucess: true, message: "Feedback added successfully", data: newFeedback });
                } else {
                    const newFeedback = await ModuleFeedback.create({ moduleId, feedback_two: [{ userId: userId, rating: rating, feedback: feedback }] });
                    return res.status(200).json({ sucess: true, message: "Feedback added successfully", data: newFeedback });
                }

            }
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ sucess: false, message: "Error adding feedback", error: error.message });
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
        res.status(500).json({ sucess: false, message: "Error getting module feedback", error: error.message });
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
        res.status(500).json({ sucess: false, message: "Error getting module feedback", error: error.message });
    }
};

exports.getUserFeedbackCheck = async (req, res) => {
    try {
        const { userId, feedback_order, moduleId } = req.body;
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
            return res.status(200).json({ sucess: true, found: false, message: "User feedback not found" });
        }
        if (feedback_order == 1) {
            if (moduleFeedback.feedback_one.some((element) => element.userId == userId)) {
                moduleFeedback.feedback_one.some((element) => {
                    if (element.userId == userId) {
                        return res.status(200).json({ sucess: true, found: true, data: element });
                    }
                })
            } else {
                return res.status(200).json({ sucess: true, found: false, message: "User feedback not found" });
            }
        } else if (feedback_order == 2) {
            if (moduleFeedback.feedback_two.some((element) => element.userId == userId)) {
                moduleFeedback.feedback_two.some((element) => {
                    if (element.userId == userId) {
                        return res.status(200).json({ sucess: true, found: true, data: element });
                    }
                })
            } else {
                return res.status(200).json({ sucess: true, found: false, message: "User feedback not found" });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucess: false, message: "Error getting user feedback", error: error.message });
    }
};

exports.getFeedbackModuleId = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const module = await NewModule.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }
        const moduleFeedback = await ModuleFeedback.findOne({ moduleId })
            .populate("feedback_one.userId")
            .populate("feedback_two.userId")
            .lean();
        if (!moduleFeedback) {
            return res.status(404).json({ message: "Module feedback not found" });
        }
        const userFeedbackMap = new Map();
        processFeedbackArray(moduleFeedback.feedback_one, userFeedbackMap, 1);
        processFeedbackArray(moduleFeedback.feedback_two, userFeedbackMap, 2);
        const aggregatedFeedback = Array.from(userFeedbackMap.values());
        return res.status(200).json({ sucess: true, module: module, submittedUserFeedbackCount: aggregatedFeedback.length, data: aggregatedFeedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucess: false, message: "Error getting module feedback", error: error.message });
    }
};
function processFeedbackArray(feedbackArray, userMap, rating_order) {
    feedbackArray.forEach((fb) => {
        if (fb.skip) return; // Ignore skipped feedback

        const user = fb.userId;
        if (!user) return; // Skip if user not populated

        const userId = user._id.toString();

        // Get or create user entry in map
        if (!userMap.has(userId)) {
            userMap.set(userId, {
                user: {
                    _id: user._id,
                    username: user.user_name,
                    email: user.user_email,
                },
                totalRating: 0,
                averageRating: 0,
                feedbacks: [],
            });
        }

        const userData = userMap.get(userId);

        // Add rating if provided
        if (typeof fb.rating === "number") {
            if (rating_order == 2 && userData.totalRating > 0 && fb.rating > 0) {
                userData.averageRating = Math.round((userData.totalRating + fb.rating) / 2);
                userData.totalRating += fb.rating;
            } else {
                userData.totalRating += fb.rating;
                userData.averageRating = userData.totalRating;
            }
        }

        // Add feedback entry
        userData.feedbacks.push({
            rating: fb.rating,
            feedback: fb.feedback,
            timestamp: fb.timestamp,
            feedbackType: fb.feedbackType, // Add if you have type information
        });
    });
}

exports.getAllModuleFeedbacksRatings = async (req, res) => {
    try {
        const moduleFeedbacks = await ModuleFeedback.find({}).populate("feedback_one.userId").populate("feedback_two.userId").lean();
        const AllFeedbacks = [];
        moduleFeedbacks.forEach((moduleFeedback) => {
            const userFeedbackMap = new Map();
            processFeedbackArray(moduleFeedback.feedback_one, userFeedbackMap, 1);
            processFeedbackArray(moduleFeedback.feedback_two, userFeedbackMap, 2);
            const aggregatedFeedback = Array.from(userFeedbackMap.values());
            const finalData = { module: moduleFeedback, submittedUserFeedbackCount: aggregatedFeedback.length, data: aggregatedFeedback };
            AllFeedbacks.push(finalData);
        });

        return res.status(200).json({ sucess: true, data: AllFeedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucess: false, message: "Error getting module feedback", error: error.message });
    }
};

