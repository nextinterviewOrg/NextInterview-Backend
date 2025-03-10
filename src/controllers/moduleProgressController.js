const ModuleProgress = require("../Models/moduleProgressModel");

// Get completed and ongoing counts for a module, topic, or subtopic
exports.getProgressCount = async (req, res) => {
  try {
    const moduleProgress = await ModuleProgress.find();
    console.log(moduleProgress);

    if (!moduleProgress) {
      return res.status(404).json({ success: false, message: "Module progress not found" });
    }
    let allMosuleAverageCompletion = 0;
    let MaxModule = null;
    let MinModule = null;
    let MostviewedModuleCode = "";
    let Mostviews=0;
    let LeastviewedModuleCode = "";
    let Leastviews=0;
    let AllmoduleAverageCompletion = 0;
    let allModuleStats = [];

    moduleProgress.forEach((progressmodule) => {
      let moduleStats = {
        ongoing: 0,
        completed: 0,
        views:0,
        averageCompletion: 0,
        moduleCode: "",
        topicStats: {},
      };
      moduleStats.moduleCode = progressmodule.moduleCode;

      progressmodule.progress.forEach((progress) => {
        if (progress.status === 'ongoing') moduleStats.ongoing += 1;
        else if (progress.status === 'completed') moduleStats.completed += 1;
        moduleStats.averageCompletion = Number.parseFloat((moduleStats.completed / (moduleStats.ongoing + moduleStats.completed)) * 100).toFixed(0);
        moduleStats.views = (moduleStats.ongoing + moduleStats.completed);

        let topicStats = {
          ongoing: 0,
          completed: 0,
          topicCode: "",
          subtopicStats: {},
        };

        progress.progressTopics.forEach((topic) => {
          if (topic.status === 'ongoing') topicStats.ongoing += 1;
          else if (topic.status === 'completed') topicStats.completed += 1;
          topicStats.topicCode = topic.topicCode;
          let subtopicStats = {
            ongoing: 0,
            completed: 0,
            subtopicCode: "",
          };

          topic.progressSubtopics.forEach((subtopic) => {
            if (subtopic.status === 'ongoing') subtopicStats.ongoing += 1;
            else if (subtopic.status === 'completed') subtopicStats.completed += 1;
            subtopicStats.subtopicCode = subtopic.subtopicCode
          });

          topicStats.subtopicStats = subtopicStats;
        });

        moduleStats.topicStats = topicStats;
      });
      if (MaxModule === null) {
        MaxModule = (moduleStats.completed + moduleStats.ongoing);
        MostviewedModuleCode = moduleStats.moduleCode;
        Mostviews = (moduleStats.completed + moduleStats.ongoing);
      }
      if (MaxModule < (moduleStats.completed + moduleStats.ongoing)) {
        MaxModule = (moduleStats.completed + moduleStats.ongoing);
        MostviewedModuleCode = moduleStats.moduleCode;
        Mostviews = (moduleStats.completed + moduleStats.ongoing);
      }
      if (MinModule === null) {
        MinModule = (moduleStats.completed + moduleStats.ongoing);
        LeastviewedModuleCode = moduleStats.moduleCode;
        Leastviews = (moduleStats.completed + moduleStats.ongoing);
      }

      if (MinModule > (moduleStats.completed + moduleStats.ongoing)) {
        MinModule = (moduleStats.completed + moduleStats.ongoing);
        LeastviewedModuleCode = moduleStats.moduleCode;
        Leastviews = (moduleStats.completed + moduleStats.ongoing);
      }
      AllmoduleAverageCompletion += Number(moduleStats.averageCompletion);

      allModuleStats.push(moduleStats);
    });

    res.status(200).json({
      success: true,
      message: "Progress count fetched successfully",
      MostviewedModuleCode,
      Mostviews,
      LeastviewedModuleCode,
      Leastviews,
      AllmoduleAverageCompletion: Number.parseFloat(AllmoduleAverageCompletion / allModuleStats.length).toFixed(0),

      data: allModuleStats,

    });
  } catch (error) {
    console.error("Error fetching progress count:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching progress count",
      error: error.message,
    });
  }
};


exports.getProgressCountByFilter = async (req, res) => {
  try {
    const { moduleCode, topicCode, subtopicCode } = req.query;
    let filter = {};

    if (moduleCode) filter.moduleCode = moduleCode;
    if (topicCode) filter['progress.progressTopics.topicCode'] = topicCode;
    if (subtopicCode) filter['progress.progressTopics.progressSubtopics.subtopicCode'] = subtopicCode;
    const moduleProgress = await ModuleProgress.find(filter);
    if (!moduleProgress.length) {
      return res.status(404).json({ success: false, message: "Module progress not found" });
    }

    let allModuleStats = [];

    moduleProgress.forEach((progressModule) => {
      let moduleStats = {
        ongoing: 0,
        completed: 0,
        moduleCode: progressModule.moduleCode,
        topicStats: {},
      };

      progressModule.progress.forEach((progress) => {
        if (progress.status === 'ongoing') moduleStats.ongoing += 1;
        else if (progress.status === 'completed') moduleStats.completed += 1;

        let topicStats = {
          ongoing: 0,
          completed: 0,
          topicCode: progress.progressTopics.topicCode,
          subtopicStats: {},
        };

        progress.progressTopics.forEach((topic) => {
          if (topic.status === 'ongoing') topicStats.ongoing += 1;
          else if (topic.status === 'completed') topicStats.completed += 1;
          topicStats.topicCode = topic.topicCode;

          let subtopicStats = {
            ongoing: 0,
            completed: 0,
            subtopicCode: topic.progressSubtopics.subtopicCode,
          };

          topic.progressSubtopics.forEach((subtopic) => {
            if (subtopic.status === 'ongoing') subtopicStats.ongoing += 1;
            else if (subtopic.status === 'completed') subtopicStats.completed += 1;
            subtopicStats.subtopicCode = subtopic.subtopicCode
          });
          topicStats.subtopicStats = subtopicStats;
        });

        moduleStats.topicStats = topicStats;
      });

      allModuleStats.push(moduleStats);
    });

    res.status(200).json({
      success: true,
      data: allModuleStats,
    });

  } catch (error) {
    console.error("Error fetching progress count:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching progress count",
      error: error.message,
    });
  }
};
