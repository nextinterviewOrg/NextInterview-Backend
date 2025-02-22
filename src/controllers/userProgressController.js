const UserProgress = require("../Models/userProgressModel");

exports.getUserProgress = async (req, res) => {   
    try {
        const userId = req.params.id;
        const userProgress = await UserProgress.findOne({ userId });
        res.status(200).json(userProgress);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve user progress" });
    }
};


exports.updateUserProgressModel = async (req, res) =>{
    const { userId, moduleCode,moduleId } = req.body;
  
    try {
      let userProgress = await UserProgress.findOne({ userId });
  
      if (!userProgress) {
        userProgress = new UserProgress({ userId });
      }
  
    
      const moduleIndex = userProgress.completedModules.findIndex(
        (m) => m.moduleCode === moduleCode
      );
      if (moduleIndex === -1) {
        userProgress.completedModules.push({
          moduleId,
          moduleCode,
          completed: true,
          completedAt: new Date(),
        });
      } else {
        userProgress.completedModules[moduleIndex].completed = true;
        userProgress.completedModules[moduleIndex].completedAt = new Date();
      }
  
      await userProgress.save();
      res.status(200).send({ success: true, message: "Module marked as completed!" });
    } catch (error) {
      res.status(500).send({ success: false, message: "Error updating progress", error: error.message });
    }
  };