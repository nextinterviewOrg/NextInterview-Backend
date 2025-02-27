const mongoose = require("mongoose");

const moduleProgressSchema = new mongoose.Schema(
    {
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NewModule",
        },
        moduleCode: String,
        progress: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },

                completed: {
                    type: Boolean,
                    default: false,
                },
                status: {
                    type: String,
                    enum: ['completed', 'ongoing'],
                    default: 'ongoing',
                },
                startedAt: Date,
                completedAt: Date,
                progressTopics: [
                    {
                        userId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "User",
                        },
                        topicID: {
                            type: mongoose.Schema.Types.ObjectId,
                        },
                        topicCode: String,
                        completed: {
                            type: Boolean,
                            default: false,
                        },
                        status: {
                            type: String,
                            enum: ['completed', 'ongoing'],
                            default: 'ongoing',
                        },
                        startedAt: Date,
                        completedAt: Date,

                        progressSubtopics: [
                            {
                                userId: {
                                    type: mongoose.Schema.Types.ObjectId,
                                    ref: "User",
                                },
                                subtopicId: {
                                    type: mongoose.Schema.Types.ObjectId,
                                },
                                subtopicCode: String,
                                completed: {
                                    type: Boolean,
                                    default: false,
                                },
                                status: {
                                    type: String,
                                    enum: ['completed', 'ongoing'],
                                    default: 'ongoing',
                                },
                                startedAt: Date,
                                completedAt: Date,

                            },
                        ],


                    },
                ],
            },
        ],

    },
    { timestamps: true }
);

module.exports = mongoose.model("ModuleProgress", moduleProgressSchema);
