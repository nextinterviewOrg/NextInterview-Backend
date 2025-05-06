const UserProgress = require("../Models/userProgressModel");
const ModuleProgress = require("../Models/moduleProgressModel");
const NewModule = require("../Models/addNewModuleModel");

exports.startModule = async (req, res) => {
  try {
    const { userId, moduleCode, moduleID } = req.body;

    let userProgress = await UserProgress.findOne({ userId });
    let moduleProgress = await ModuleProgress.findOne({ moduleId: moduleID });

    if (!userProgress) {

      userProgress = new UserProgress({ userId, progress: [] });
    }

    if (!moduleProgress) {

      moduleProgress = new ModuleProgress({ moduleId: moduleID, moduleCode, progress: [] });
    }

    const module = userProgress.progress.find(
      (mod) => mod.moduleCode === moduleCode
    );

    if (!module) {
      userProgress.progress.push({
        moduleCode,
        moduleID,
        status: 'ongoing',
        startedAt: new Date(),
        completedAt: null,
        progressTopics: [],
      });
    }
    // else {
    //   module.status = 'ongoing';
    //   module.startedAt = new Date();
    // }

    await userProgress.save();
    moduleProgress.progress.push({
      userId,
      status: 'ongoing',
      startedAt: new Date(),
      completedAt: null,
    })
    await moduleProgress.save();

    res.status(200).json({ message: "Module started successfully", userProgress: userProgress, moduleProgress: moduleProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error starting module", error: error.message });
  }
};

exports.startTopic = async (req, res) => {
  try {
    const { userId, moduleCode, topicCode, topicID } = req.body;
    console.log("body", req.body);

    // Find user progress
    const userProgress = await UserProgress.findOne({ userId });
    let moduleProgress = await ModuleProgress.findOne({ moduleCode });

    if (!userProgress) {
      console.log("User progress not found");
      return res.status(404).json({ message: "User progress not found" });
    }

    if (!moduleProgress) {
      console.log("Module progress not found");
      return res.status(404).json({ message: "Module progress not found" });
    }

    const module = userProgress.progress.find(
      (mod) => { console.log("mod", mod); return mod.moduleCode === moduleCode }
    );
    console.log("module", module);

    if (!module) {
      console.log("Module not found");
      return res.status(404).json({ message: "Module not found" });
    }

    const topic = module.progressTopics.find(
      (top) => top.topicCode === topicCode
    );

    if (!topic) {

      module.progressTopics.push({
        topicCode,
        topicID,
        status: 'ongoing',
        startedAt: new Date(),
        completedAt: null,
        progressSubtopics: [],
      });
    }
    //  else {

    //   topic.status = 'ongoing';
    //   topic.startedAt = new Date();
    // }

    await userProgress.save();

    const userModuleProgress = moduleProgress.progress.find(
      (mod) => mod.userId == userId
    )
    console.log("userModuleProgress", userModuleProgress);
    if (!userModuleProgress) {
      console.log("User module progress not found");
      return res.status(404).json({ message: "User module progress not found" });
    }
    let topicProgress = userModuleProgress.progressTopics.find(
      (top) => top.topicCode === topicCode
    );
    if (!topicProgress) {
      userModuleProgress.progressTopics.push({
        userId,
        topicCode,
        topicID,
        status: 'ongoing',
        startedAt: new Date(),
        completedAt: null,
        progressSubtopics: [],
      });
    }



    await moduleProgress.save();

    res.status(200).json({ message: "Topic started successfully", userProgress: userProgress, moduleProgress: moduleProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error starting topic", error: error.message });
  }
};

exports.startSubtopic = async (req, res) => {
  try {
    const { userId, moduleCode, topicCode, subtopicCode, subtopicId } = req.body;
    console.log("body", req.body);

    const userProgress = await UserProgress.findOne({ userId });
    let moduleProgress = await ModuleProgress.findOne({ moduleCode });

    if (!userProgress) {
      return res.status(404).json({ message: "User progress not found" });
    }

    const module = userProgress.progress.find(
      (mod) => mod.moduleCode === moduleCode
    );

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const topic = module.progressTopics.find(
      (top) => top.topicCode === topicCode
    );

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const subtopic = topic.progressSubtopics.find(
      (sub) => sub.subtopicCode === subtopicCode
    );

    if (!subtopic) {

      topic.progressSubtopics.push({
        subtopicCode,
        subtopicId,
        status: 'ongoing',
        startedAt: new Date(),
        completedAt: null,
      });
    }
    // else {

    //   subtopic.status = 'ongoing';
    //   subtopic.startedAt = new Date();
    // }

    await userProgress.save();
    const userModuleProgress = moduleProgress.progress.find(
      (mod) => mod.userId == userId
    )

    if (!userModuleProgress) {
      return res.status(404).json({ message: "User module progress not found" });
    }
    let topicProgress = userModuleProgress.progressTopics.find(
      (top) => top.topicCode === topicCode
    );
    let subtopicProgress = topicProgress.progressSubtopics.find(
      (sub) => sub.subtopicCode === subtopicCode
    )
    if (!subtopicProgress) {
      topicProgress.progressSubtopics.push({
        userId,
        subtopicCode,
        subtopicId,
        status: 'ongoing',
        startedAt: new Date(),
        completedAt: null,
      });
    }
    await moduleProgress.save();

    res.status(200).json({ message: "Subtopic started successfully", userProgress: userProgress, moduleProgress: moduleProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error starting subtopic", error: error.message });
  }
};

exports.completeModule = async (req, res) => {
  try {
    const { userId, moduleCode } = req.body;

    const userProgress = await UserProgress.findOne({ userId });
    let moduleProgress = await ModuleProgress.findOne({ moduleCode });

    if (!userProgress) {
      return res.status(404).json({ message: "User progress not found" });
    }
    if (!moduleProgress) {
      return res.status(404).json({ message: "Module progress not found" });
    }

    const module = userProgress.progress.find(
      (mod) => mod.moduleCode == moduleCode
    );
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    module.status = 'completed';
    module.completedAt = new Date();
    module.completed = true;

    await userProgress.save();

    const moduleProgressToUpdate = moduleProgress.progress.find(
      (mod) => mod.userId == userId
    );

    if (!moduleProgressToUpdate) {
      return res.status(404).json({ message: "Module progress not found" });
    }

    moduleProgressToUpdate.status = 'completed';
    moduleProgressToUpdate.completedAt = new Date();
    moduleProgressToUpdate.completed = true;

    await moduleProgress.save();

    res.status(200).json({ message: "Module completed successfully", userProgress: userProgress, moduleProgress: moduleProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing module", error: error.message });
  }
};

exports.completeTopic = async (req, res) => {
  try {
    const { userId, moduleCode, topicCode } = req.body;

    const userProgress = await UserProgress.findOne({ userId });
    let moduleProgress = await ModuleProgress.findOne({ moduleCode });
    let userModuleProgress = moduleProgress.progress.find(
      (mod) => mod.userId == userId
    )
    let usertopicProgress = userModuleProgress.progressTopics.find(
      (top) => top.topicCode === topicCode && top.userId == userId
    )
    usertopicProgress.status = 'completed';
    usertopicProgress.completedAt = new Date();
    usertopicProgress.completed = true;
    await moduleProgress.save();

    if (!userProgress) {
      return res.status(404).json({ message: "User progress not found" });
    }


    const module = userProgress.progress.find(
      (mod) => mod.moduleCode === moduleCode
    );

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }


    const topic = module.progressTopics.find(
      (top) => top.topicCode === topicCode
    );

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }


    topic.status = 'completed';
    topic.completedAt = new Date();


    await userProgress.save();

    res.status(200).json({ message: "Topic completed successfully", userProgress: userProgress, moduleProgress: moduleProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing topic", error: error.message });
  }
};

exports.completeSubtopic = async (req, res) => {
  try {
    const { userId, moduleCode, topicCode, subtopicCode } = req.body;

    console.log("body", req.body);
    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(404).json({ message: "User progress not found" });
    }


    const module = userProgress.progress.find(
      (mod) => mod.moduleCode === moduleCode
    );

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }


    const topic = module.progressTopics.find(
      (top) => top.topicCode === topicCode
    );

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    console.log("topic", topic);

    const subtopic = topic.progressSubtopics.find(
      (sub) => sub.subtopicCode === subtopicCode
    );
 
    if (!subtopic) {
      return res.status(404).json({ message: "Subtopic not found" });
    }


    subtopic.status = 'completed';
    subtopic.completedAt = new Date();


    await userProgress.save();

    let moduleProgress = await ModuleProgress.findOne({ moduleCode });
    let userModuleProgress = moduleProgress.progress.find(
      (mod) => mod.userId == userId
    )
    let usertopicProgress = userModuleProgress.progressTopics.find(
      (top) => top.topicCode === topicCode && top.userId == userId
    )
    let usersubtopicProgress = usertopicProgress.progressSubtopics.find(
      (sub) => sub.subtopicCode === subtopicCode && sub.userId == userId
    )
    usersubtopicProgress.status = 'completed';
    usersubtopicProgress.completedAt = new Date();
    usersubtopicProgress.completed = true;

    res.status(200).json({ message: "Subtopic completed successfully", userProgress: userProgress, moduleProgress: moduleProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing subtopic", error: error.message });
  }
};


exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(200).json({ success: false, message: "User progress not found" });
    }

    res.status(200).json({ message: "User progress fetched successfully", data: userProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user progress", error: error.message });
  }
};
exports.getProgressStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(200).json({ success: false, message: "User progress not found" });
    }

    let moduleStatsData = [];
    let moduleStats = {
      ongoing: 0,
      completed: 0

    };

    userProgress.progress.forEach((module) => {
      if (module.status === 'ongoing') moduleStats.ongoing += 1;
      if (module.status === 'completed') moduleStats.completed += 1;

      let topicStats = {
        ongoing: 0,
        completed: 0,
        subtopicStats: {}
      };

      module.progressTopics.forEach((topic) => {
        if (topic.status === 'ongoing') topicStats.ongoing += 1;
        if (topic.status === 'completed') topicStats.completed += 1;


        let subtopicStats = {
          ongoing: 0,
          completed: 0
        };

        topic.progressSubtopics.forEach((subtopic) => {
          if (subtopic.status === 'ongoing') subtopicStats.ongoing += 1;
          if (subtopic.status === 'completed') subtopicStats.completed += 1;
        });

        topicStats.subtopicStats = subtopicStats;
      });

      moduleStatsData.push({
        moduleCode: module.moduleCode,
        topicStats,
      });
    });

    res.status(200).json({
      success: true,
      message: "User progress statistics fetched successfully",
      moduleStats,
      ModuleProgress: moduleStatsData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching progress stats",
      error: error.message,
    });
  }
};

exports.getUserProgressByModuleCode = async (req, res) => {
  try {
    const { userId, moduleCode } = req.body;
    console.log("Recieved", userId, moduleCode);

    if (!userId || !moduleCode) {
      return res.status(400).json({ message: "UserId and moduleCode are required" });
    }

    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(200).json({ success: false, message: "User progress not found" });
    }

    const moduleProgress = userProgress.progress.find((mod) => mod.moduleCode === moduleCode);

    if (!moduleProgress) {
      return res.status(200).json({ success: false, message: "Module progress not found" });
    }

    res.status(200).json({ success: true, message: "User module progress fetched successfully", data: moduleProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user module progress", error: error.message });
  }
};

exports.getUserProgressByTopicCode = async (req, res) => {
  try {
    const { userId, moduleCode, topicCode } = req.body;

    if (!userId || !moduleCode || !topicCode) {
      return res.status(400).json({ message: "UserId, moduleCode, and topicCode are required" });
    }

    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(200).json({ success: false, message: "User progress not found" });
    }

    const moduleProgress = userProgress.progress.find((mod) => mod.moduleCode === moduleCode);

    if (!moduleProgress) {
      return res.status(200).json({ success: false, message: "Module progress not found" });
    }

    const topicProgress = moduleProgress.progressTopics.find((topic) => topic.topicCode === topicCode);

    if (!topicProgress) {
      return res.status(200).json({ success: false, message: "Topic progress not found" });
    }

    res.status(200).json({ success: true, message: "User topic progress fetched successfully", data: topicProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user topic progress", error: error.message });
  }
};

exports.getUserProgressBySubtopicCode = async (req, res) => {
  try {
    const { userId, moduleCode, topicCode, subtopicCode } = req.body;

    if (!userId || !moduleCode || !topicCode || !subtopicCode) {
      return res.status(400).json({ message: "UserId, moduleCode, topicCode, and subtopicCode are required" });
    }

    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(200).json({ success: false, message: "User progress not found" });
    }

    const moduleProgress = userProgress.progress.find((mod) => mod.moduleCode === moduleCode);

    if (!moduleProgress) {
      return res.status(200).json({ success: false, message: "Module progress not found" });
    }

    const topicProgress = moduleProgress.progressTopics.find((topic) => topic.topicCode === topicCode);

    if (!topicProgress) {
      return res.status(200).json({ success: false, message: "Topic progress not found" });
    }

    const subtopicProgress = topicProgress.progressSubtopics.find((subtopic) => subtopic.subtopicCode === subtopicCode);

    if (!subtopicProgress) {
      return res.status(200).json({ success: false, message: "Subtopic progress not found" });
    }

    res.status(200).json({ success: true, message: "User subtopic progress fetched successfully", data: subtopicProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user subtopic progress", error: error.message });
  }
};

exports.getUserCompletedModules = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(200).json({ success: false, message: "User progress not found" });
    }

    const completedModules = userProgress.progress
      .filter((mod) => mod.completed === true)
      .map((mod) => ({
        moduleCode: mod.moduleCode,
        moduleId: mod.moduleID,
      }));
    console.log(completedModules);

    res.status(200).json({ success: true, message: "User completed modules fetched successfully", data: completedModules });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user completed modules", error: error.message });
  }
};
exports.checkSubtopicCompletion = async (req, res) => {
  const { userId, moduleCode, topicCode } = req.params;

  try {
    const userProgress = await UserProgress.findOne({
      userId,
      "progress.moduleCode": moduleCode
    });
    const module = await NewModule.findOne({ module_code: moduleCode });
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const topic = module.topicData.find(t => t.topic_code === topicCode);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    const subtopicNumber = topic.subtopicData.length;
    const subtopicCodes = topic.subtopicData.map(s => s.subtopic_code);

    if (!userProgress) {
      return res.status(404).json({ message: "User progress not found" });
    }

    const moduleProgress = userProgress.progress.find(
      p => p.moduleCode === moduleCode
    );

    if (!moduleProgress) {
      return res.status(404).json({ message: "Module progress not found" });
    }

    const topicProgress = moduleProgress.progressTopics.find(
      t => t.topicCode === topicCode
    );

    if (!topicProgress) {
      return res.status(404).json({ message: "Topic progress not found" });
    }

    const allCompleted = topicProgress.progressSubtopics.every(
      subtopic => subtopic.status === 'completed'
    );
    const subtopicCompleted=topicProgress.progressSubtopics.filter(s => s.status === 'completed');

    res.status(200).json({
      moduleCode,
      topicCode,
      allSubtopicCompleted: subtopicCompleted.length === subtopicNumber,
      completedCount: topicProgress.progressSubtopics.filter(s => s.status === 'completed').length,
      totalSubtopics: topicProgress.progressSubtopics.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.checkAllTopicsCompletion = async (req, res) => {
  const { userId, moduleCode } = req.params;

  try {
    // Get module structure
    const module = await NewModule.findOne({ module_code: moduleCode });
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Get user progress
    const userProgress = await UserProgress.findOne({
      userId,
      "progress.moduleCode": moduleCode
    });

    if (!userProgress) {
      return res.status(200).json({
        moduleCode,
        allTopicsCompleted: false,
        completedTopics: 0,
        totalTopics: module.topicData.length
      });
    }

    const moduleProgress = userProgress.progress.find(
      p => p.moduleCode === moduleCode
    );

    // Check if all topics in the module are completed
    const allTopicsCompleted = module.topicData.every(modTopic => {
      const userTopic = moduleProgress?.progressTopics.find(
        t => t.topicCode === modTopic.topic_code
      );
      
      return userTopic?.status === 'completed' && 
             userTopic.progressSubtopics.every(s => s.status === 'completed');
    });

    const completedTopics = moduleProgress?.progressTopics.filter(
      t => t.status === 'completed' && 
          t.progressSubtopics.every(s => s.status === 'completed')
    ).length || 0;
 

    res.status(200).json({
      moduleCode,
      allTopicsCompleted : completedTopics === module.topicData.length,
      completedTopics,
      totalTopics: module.topicData.length,
      moduleCompleted: moduleProgress?.status === 'completed'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};