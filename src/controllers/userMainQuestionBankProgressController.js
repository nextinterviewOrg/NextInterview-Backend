const UserMainQuestionBankProgress = require("../Models/userMainQuestionBankProgressModel");
const UserMainQuestionBank = require("../Models/mainQuestionBankModel");
const mongoose = require("mongoose");
const NewModule = require("../Models/addNewModuleModel");

exports.createUserQuestionBankProgress = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            moduleId,
            userId,
            questionBankId,
            answer,
            choosen_option
        } = req.body;
        console.log(req.body);

        if (!moduleId || !userId || !questionBankId) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const module = await NewModule.findOne({ module_code: moduleId });
        if (!module) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Module not found" });
        }
        const question = await UserMainQuestionBank.findById(questionBankId);
        if (!question) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        const question_type = question.question_type;
        if (question_type === 'mcq' && !choosen_option) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Chosen option required for MCQ questions" });
        }
        let answerStatus = null;
        if (question.question_type === 'mcq') {
            answerStatus = question.correct_option === choosen_option ? 'correct' : 'wrong';
        } else {
            answerStatus = question.answer === answer ? 'correct' : 'wrong';
        }
        let moduleProgress = await UserMainQuestionBankProgress.findOne({ moduleId: module._id }).session(session);
        if (!moduleProgress) {
            moduleProgress = new UserMainQuestionBankProgress({
                moduleId: module._id,
                progress: [{
                    userId:new mongoose.Types.ObjectId(userId),
                    answered_Questions: [{
                        questionBankId,
                        answer,
                        question_type,
                        choosen_option: question_type === 'mcq' ? choosen_option : undefined
                    }]
                }]
            });
            await moduleProgress.save({ session });
            await session.commitTransaction();

            return res.status(201).json({
                success: true,
                message: "Module created with initial question",
                data: moduleProgress,
                question: question,
                answerStatus
            });
        }
        const userProgress = moduleProgress.progress.find(p => p.userId.equals(userId))
        if (!userProgress) {
            moduleProgress.progress.push({
                userId,
                answered_Questions: [{
                    questionBankId,
                    answer,
                    question_type,
                    choosen_option: question_type === 'mcq' ? choosen_option : undefined
                }]
            });
            await moduleProgress.save({ session });
            await session.commitTransaction();
            return res.status(200).json({
                success: true,
                message: "User added to module with new question",
                data: moduleProgress,
                question: question,
                answerStatus

            });
        }
        const existingQuestion = userProgress.answered_Questions.find(q =>
            q.questionBankId === questionBankId
        );
        if (existingQuestion) {
            await session.abortTransaction();
            return res.status(200).json({
                success: false,
                message: "Question already answered by user"
            });
        }
        userProgress.answered_Questions.push({
            questionBankId,
            answer,
            question_type,
            choosen_option: question_type === 'mcq' ? choosen_option : undefined
        });



        await moduleProgress.save({ session });
        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "Question added to user progress",
            data: moduleProgress,
            question: question,
            answerStatus

        });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to create UserQuestionBankProgress", error: err.message });
    }
    finally {
        session.endSession();
    }
};
exports.checkUserAnsweredQuestion = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            moduleId,
            userId,
            questionBankId,
        } = req.body;

        if (!moduleId || !userId || !questionBankId) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const module = await NewModule.findOne({ module_code: moduleId });
        if (!module) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Module not found" });
        }
        const moduleProgress = await UserMainQuestionBankProgress.findOne({ moduleId: module._id }).session(session);
        if (!moduleProgress) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Module not found" });
        }
        const userProgress = moduleProgress.progress.find(p => p.userId.equals(userId))
        if (!userProgress) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "User not found in module" });
        }
        const existingQuestion = userProgress.answered_Questions.find(q =>
            q.questionBankId === questionBankId
        );
        if (!existingQuestion) {
            await session.abortTransaction();
            return res.status(200).json({
                success: false,
                message: "Question not answered by user"
            });
        }
        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: "Question already answered by user",
            data:existingQuestion
        });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to create UserQuestionBankProgress", error: err.message });
    }
    finally {
        session.endSession();
    }
};  