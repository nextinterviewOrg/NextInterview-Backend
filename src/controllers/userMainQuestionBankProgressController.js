const UserMainQuestionBankProgress = require("../Models/userMainQuestionBankProgressModel");
const UserMainQuestionBank = require("../Models/mainQuestionBankModel");
const mongoose = require("mongoose");
const NewModule = require("../Models/addNewModuleModel");

exports.createUserQuestionBankProgress = async (req, res) => {
    // Remove transaction for standalone MongoDB
    try {
        const {
            moduleId,
            userId,
            questionBankId,
            answer,
            choosen_option,
            finalResult,
            output
        } = req.body;
        console.log(req.body);

        // Input validation
        if (!moduleId || !userId || !questionBankId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Find module
        const module = await NewModule.findOne({ module_code: moduleId });
        if (!module) {
            return res.status(404).json({ success: false, message: "Module not found" });
        }

        // Find question
        const question = await UserMainQuestionBank.findById(questionBankId);
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        const question_type = question.question_type;
        
        // Validate MCQ question
        if (question_type === 'mcq' && !choosen_option) {
            return res.status(400).json({ 
                success: false, 
                message: "Chosen option required for MCQ questions" 
            });
        }

        // Determine answer status
        let answerStatus = null;
        if (question_type === 'mcq') {
            answerStatus = question.correct_option === choosen_option;
        } else {
            answerStatus = question.answer === answer;
        }

        // Find or create progress document
        let moduleProgress = await UserMainQuestionBankProgress.findOne({ 
            moduleId: module._id 
        });

        if (!moduleProgress) {
            moduleProgress = new UserMainQuestionBankProgress({
                moduleId: module._id,
                progress: [{
                    userId: new mongoose.Types.ObjectId(userId),
                    answered_Questions: [{
                        questionBankId,
                        answer,
                        question_type,
                        choosen_option: question_type === 'mcq' ? choosen_option : undefined,
                        output: question_type === 'coding' ? output : undefined,
                        finalResult: question_type === 'coding' ? finalResult : answerStatus
                    }]
                }]
            });
            await moduleProgress.save();

            return res.status(201).json({
                success: true,
                message: "Module created with initial question",
                data: moduleProgress,
                question: question,
                finalResult: answerStatus
            });
        }

        // Find user progress
        const userProgress = moduleProgress.progress.find(p => p.userId.equals(userId));

        if (!userProgress) {
            moduleProgress.progress.push({
                userId,
                answered_Questions: [{
                    questionBankId,
                    answer,
                    question_type,
                    choosen_option: question_type === 'mcq' ? choosen_option : undefined,
                    output: question_type === 'coding' ? output : undefined,
                    finalResult: question_type === 'coding' ? finalResult : answerStatus
                }]
            });
            await moduleProgress.save();
            
            return res.status(200).json({
                success: true,
                message: "User added to module with new question",
                data: moduleProgress,
                question: question,
                finalResult: answerStatus,
                output,
            });
        }

        // Check if question already exists
        const existingQuestion = userProgress.answered_Questions.find(q =>
            q.questionBankId === questionBankId
        );

        if (existingQuestion) {
            userProgress.answered_Questions = userProgress.answered_Questions.map(q => {
                if (q.questionBankId === questionBankId) {
                    return {
                        ...q,
                        answer,
                        question_type,
                        choosen_option: question_type === 'mcq' ? choosen_option : undefined,
                        output: question_type === 'coding' ? output : undefined,
                        finalResult: question_type === 'coding' ? finalResult : answerStatus
                    };
                }
                return q;
            });

            await moduleProgress.save();

            return res.status(200).json({
                success: true,
                message: "Question already answered by user and result updated",
                data: userProgress.answered_Questions
            });
        }

        // Add new question to user progress
        userProgress.answered_Questions.push({
            questionBankId,
            answer,
            question_type,
            choosen_option: question_type === 'mcq' ? choosen_option : undefined,
            output: question_type === 'coding' ? output : undefined,
            finalResult: question_type === 'coding' ? finalResult : answerStatus
        });

        await moduleProgress.save();
        
        return res.status(200).json({
            success: true,
            message: "Question added to user progress",
            data: moduleProgress,
            question: question,
            finalResult: answerStatus
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to create UserQuestionBankProgress", 
            error: err.message 
        });
    }
};


// exports.createUserQuestionBankProgress = async (req, res) => {
//     //  const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const {
//             moduleId,
//             userId,
//             questionBankId,
//             answer,
//             choosen_option,
//             finalResult,
//             output
//         } = req.body;
//         console.log(req.body);
//         if (!moduleId || !userId || !questionBankId) {
//             //await session.abortTransaction();
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing required fields"
//             });
//         }
//         const module = await NewModule.findOne({
//             module_code: moduleId
//         });
//         if (!module) {
//             // await session.abortTransaction();
//             return res.status(404).json({
//                 success: false,
//                 message: "Module not found"
//             });
//         }
//         const question = await UserMainQuestionBank.findById(questionBankId);
//         if (!question) {
//             // await session.abortTransaction();
//             return res.status(404).json({
//                 success: false,
//                 message: "Question not found"
//             });
//         }
//         const question_type = question.question_type;
//         if (question_type === 'mcq' && !choosen_option) {
//             //   await session.abortTransaction();
//             return res.status(400).json({
//                 success: false,
//                 message: "Chosen option required for MCQ questions"
//             });
//         }
//         let answerStatus = null;
//         if (question.question_type === 'mcq') {
//             answerStatus = question.correct_option === choosen_option ? true : false;
//         } else {
//             console.log("question.answer", question.answer);
//             answerStatus = question.answer === answer ? true : false;
//         }
//         let moduleProgress = await UserMainQuestionBankProgress.findOne({
//             moduleId: module._id
//         })
//         //.session(session);
//         if (!moduleProgress) {
//             moduleProgress = new UserMainQuestionBankProgress({
//                 moduleId: module._id,
//                 progress: [{
//                     userId: new mongoose.Types.ObjectId(userId),
//                     answered_Questions: [{
//                         questionBankId,
//                         answer,
//                         question_type,
//                         choosen_option: question_type === 'mcq' ? choosen_option : undefined,
//                         output: question_type === 'coding' ? output : undefined,
//                         finalResult: question_type === 'coding' ? finalResult : answerStatus
//                     }]
//                 }]
//             });
//             await moduleProgress.save();
//             // await moduleProgress.save({
//             //    session
//             //  });
//             // await session.commitTransaction();
 
//             return res.status(201).json({
//                 success: true,
//                 message: "Module created with initial question",
//                 data: moduleProgress,
//                 question: question,
//                 finalResult: answerStatus
//             });
//         }
//         const userProgress = moduleProgress.progress.find(p => p.userId.equals(userId));
//          if (!userProgress) {
//             moduleProgress.progress.push({
//                 userId,
//                 answered_Questions: [{
//                     questionBankId,
//                     answer,
//                     question_type,
//                     choosen_option: question_type === 'mcq' ? choosen_option : undefined,
//                     output: question_type === 'coding' ? output : undefined,
//                     finalResult: question_type === 'coding' ? finalResult : answerStatus
//                 }]
//             });
//             // await moduleProgress.save({
//             //    session
//             //  });
//             await moduleProgress.save();
//             // await session.commitTransaction();
//             return res.status(200).json({
//                 success: true,
//                 message: "User added to module with new question",
//                 data: moduleProgress,
//                 question: question,
//                 finalResult: answerStatus,
//                 output,
//                 finalResult,
//             });
//         }
//         const existingQuestion = userProgress.answered_Questions.find(q => q.questionBankId === questionBankId);
//         if (existingQuestion) {
//             userProgress.answered_Questions = userProgress.answered_Questions.map(q => {
//                 if (q.questionBankId === questionBankId) {
//                     q.answer = answer;
//                     q.question_type = question_type;
//                     q.choosen_option = question_type === 'mcq' ? choosen_option : undefined;
//                     q.output = question_type === 'coding' ? output : undefined;
//                     q.finalResult = question_type === 'coding' ? finalResult : answerStatus;
//                 }
//                 return q
//             });
//             //  await moduleProgress.save({
//             //    session
//             // });
//             await moduleProgress.save();
//             const existingQuestion = userProgress.answered_Questions.find(q => q.questionBankId === questionBankId);
//             // await session.abortTransaction();
//             return res.status(200).json({
//                 success: true,
//                 message: "Question already answered by user and result updated",
//                 data: userProgress.answered_Questions
//             });
//         }
//         userProgress.answered_Questions.push({
//             questionBankId,
//             answer,
//             question_type,
//             choosen_option: question_type === 'mcq' ? choosen_option : undefined,
//             output: question_type === 'coding' ? output : undefined,
//             finalResult: question_type === 'coding' ? finalResult : answerStatus
//         });
//         //await moduleProgress.save({
//         //     session
//         //});
//         await moduleProgress.save();
//         //await session.commitTransaction();
//         res.status(200).json({
//             success: true,
//             message: "Question added to user progress",
//             data: moduleProgress,
//             question: question,
//             finalResult: answerStatus
//         });
//     } catch (err) {
//         //  await session.abortTransaction();
//         console.error(err);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create UserQuestionBankProgress",
//             error: err.message
//         });
//     } finally {
//         // session.endSession();
//     }
// };

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
            data: existingQuestion
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

exports.checkUserAnsweredQuestionbyId = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
           
            userId,
            questionBankId,
        } = req.body;

        if (!userId || !questionBankId) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const question = await UserMainQuestionBank.findById(questionBankId);
        if (!question) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        const module = await NewModule.findOne({ module_code: question.module_code });
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
            data: existingQuestion
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