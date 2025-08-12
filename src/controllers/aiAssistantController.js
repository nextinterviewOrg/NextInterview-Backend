const AiAssistant = require("../Models/aiAssistantModel");
const axios = require('axios');

// OpenAI-specific Axios instance (for all calls to api.openai.com)
const openai = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2',
  },
  maxBodyLength: 50 * 1024 * 1024, // 50MB payload limit
  maxContentLength: 50 * 1024 * 1024,
});

// Local database queries (unchanged)
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
        const aiAssistants = await AiAssistant.find({ moduleId: moduleId, deleted: false });
        res.status(200).json(aiAssistants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Example OpenAI API call using the configured instance
exports.createAiAssistant = async (req, res) => {
    try {
        const response = await openai.post('/assistants', {
            model: req.body.model,
            name: req.body.name,
            description: req.body.description,
            instructions: req.body.instructions
        });

        const newAssistant = new AiAssistant({
            ...response.data,
            moduleId: req.body.moduleId
        });
        
        await newAssistant.save();
        res.status(200).json(newAssistant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};