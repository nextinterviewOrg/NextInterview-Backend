const AiAssistant = require("../Models/aiAssistantModel");



exports.getAiAssistants = async (req, res) => {
    try {
        const aiAssistants = await AiAssistant.find({ deleted: false });
        res.status(200).json(aiAssistants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAiAssistantsByModuleId = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const aiAssistants = await AiAssistant.find({ moduleId: moduleId ,deleted:false});
        res.status(200).json(aiAssistants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};