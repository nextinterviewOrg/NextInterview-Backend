const axios = require("axios");
const AiAssistant = require("../Models/aiAssistantModel");
const fs = require('fs');
const path = require('path');
const { join } = require('path');
const AiMockInterview = require("../Models/aiMockInterviewModel");

const API_KEY = process.env.GPT_API_KEY_AI
exports.createAiAssistant = async (req, res) => {
    try {
        const { model, moduleId, name, description, instructions, tools, metadata, temperature, reasoning_effort } = req.body;
        const response = await axios.post(
            "https://api.openai.com/v1/assistants",
            {
                model: model,
                name: name,
                description: description,
                instructions: instructions,
                tools: tools,
                temperature: temperature || 1,
                // reasoning_effort:  "high",
                top_p: reasoning_effort || 1,
                metadata: metadata
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );
        console.log(response);
        const aiAsistant = new AiAssistant({ ...response.data, moduleId: moduleId })
        await aiAsistant.save()

        res.status(200).json({ message: "Assistant created successfully", data: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create assistant", error: error });
    }
}

exports.getAiAssistants = async (req, res) => {
    try {
        const assistants = await axios.get(
            "https://api.openai.com/v1/assistants",
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }

        );
        res.status(200).json({ message: "Assistants fetched successfully", data: assistants.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
exports.getAiAssistantsById = async (req, res) => {
    try {
        const { id } = req.params;
        const assistants = await axios.get(
            `https://api.openai.com/v1/assistants/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }

        );
        res.status(200).json({ message: "Assistants fetched successfully", data: assistants.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
exports.modifyAiAssistant = async (req, res) => {
    try {
        const { id } = req.params;
        const { model, name, description, instructions, tools, metadata, temperature, reasoning_effort } = req.body;
        const response = await axios.post(
            `https://api.openai.com/v1/assistants/${id}`,
            {
                model: model,
                name: name,
                description: description,
                instructions: instructions,
                tools: tools,
                temperature: temperature || 1,
                top_p: reasoning_effort || 1,
                metadata: metadata
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );
        const aiAsistant = await AiAssistant.findOneAndUpdate({ id: id }, response.data, { new: true });
        res.status(200).json({ message: "Assistant modified successfully", data: response.data });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
exports.deleteAiAssistant = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.delete(
            `https://api.openai.com/v1/assistants/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );
        const aiAsistant = await AiAssistant.findOneAndUpdate({ id: id }, { deleted: true }, { new: true });
        res.status(200).json({ message: "Assistant deleted successfully", data: response.data });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
exports.createThread = async (req, res) => {
    try {
  console.log("api Key", process.env.GPT_API_KEY_AI);
        const response = await axios.post(
            `https://api.openai.com/v1/threads`,
            {

                metadata: {
                    type: "mock_interview",
                    userId: req.body.userId
                }

            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );
        return res.status(200).json({ message: "success", data: response.data });
    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
        return res.status(500).json({ message: "Failed to fetch ChatGPT response", error: error.message });
    }
}

exports.createAndRunThread = async (req, res) => {
    try {
        const response = await axios.post(
            `https://api.openai.com/v1/threads/runs`,
            {
                assistant_id: req.body.assistantId,

                thread: {
                    messages: [
                        { role: "user", content: "Explain deep learning to a 5 year old." },
                    ],
                },

            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );
        return res.status(200).json({ message: "success", data: response.data });
    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
        return res.status(500).json({ message: "Failed to fetch ChatGPT response", error: error.message });
    }
}
exports.createMessage = async (req, res) => {
    try {
        const response = await axios.post(
            `https://api.openai.com/v1/threads/${req.body.thread_id}/messages`,
            {
                role: "user",
                content: req.body.message
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );
        return res.status(200).json({ message: "success", data: response.data });
    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
        return res.status(500).json({ message: "Failed to fetch ChatGPT response", error: error.message });
    }
}

exports.runThread = async (req, res) => {
    try {

        const response = await axios.post(
            `https://api.openai.com/v1/threads/${req.body.thread_id}/runs`,
            {
                assistant_id: req.body.assistantId,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );

        return res.status(200).json({ message: "success", data: response.data });
    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
        return res.status(500).json({ message: "Failed to fetch ChatGPT response", error: error.message });
    }
}
exports.checkStatus = async (req, res) => {
    try {

        const response = await axios.get(
            `https://api.openai.com/v1/threads/${req.body.thread_id}/runs/${req.body.run_id}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );
        let runData = response.data;
        console.log("Run Status:", runData.status);
        if (runData.status === 'completed') {
            // When the run is completed, get the messages
            const messagesResponse = await axios.get(`https://api.openai.com/v1/threads/${req.body.thread_id}/messages`, {
                headers: {
                    'Authorization': `Bearer ${process.env.GPT_API_KEY_AI}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                }
            });

            console.log("Assistant Response:", messagesResponse.data);
            return res.status(200).json({ message: "success", data: messagesResponse.data });
        } else {
            console.log('Run is still in progress. Status:', runData.status);
            // Poll again in a few seconds
            // setTimeout(() => checkRunStatus(runId), 5000); // Poll every 5 seconds
            setTimeout(() => this.checkStatus(req, res), 5000);
        }
    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
        return res.status(500).json({ message: "Failed to fetch ChatGPT response", error: error.message });
    }
}
// exports.textToSpeech = async (req, res) => {
//     try {
//         const response = await axios.post(
//             'https://api.openai.com/v1/audio/speech',
//             {
//                 model: 'tts-1', 
//                 input: req.body.inputText, 
//                 voice: 'alloy', 
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${API_KEY}`,
//                     'Content-Type': 'application/json',
//                 },
//                 responseType: 'stream', 
//             }
//         );

//         const filePath = path.join(__dirname, 'speech.mp3');


//         const writer = fs.createWriteStream(filePath);

//         response.data.pipe(writer);

//         writer.on('finish', () => {
//             console.log('Audio file generated successfully: speech.mp3');

//             // Send the audio file as the response for download
//             res.setHeader('Content-Type', 'audio/mpeg')
//             res.setHeader('Content-Disposition', 'attachment; filename=speech.mp3');
//             res.sendFile(filePath, (err) => {
//                 if (err) {
//                     console.error('Error while sending the file:', err);
//                     return res.status(500).send('Error downloading the file');
//                 }

//                 fs.unlinkSync(filePath);
//             });
//         });

//         writer.on('error', (err) => {
//             console.error('Error writing the file:', err);
//             res.status(500).send('Error generating speech.');
//         });
//     } catch (error) {
//         console.error('Error fetching ChatGPT response:', error);
//         res.status(500).json({ message: 'Failed to generate speech', error: error.message });
//     }
// }
exports.textToSpeech = async (req, res) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/audio/speech',
            {
                model: 'tts-1',
                input: req.body.inputText,
                voice: 'alloy',
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'arraybuffer',  // Use arraybuffer to handle binary data
            }
        );

        const base64Audio = Buffer.from(response.data, 'binary').toString('base64');

        // Return base64 encoded WAV audio in the response
        res.status(200).json({
            audio: `data:audio/wav;base64,${base64Audio}`,  // You can send the base64-encoded audio directly
        });


    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
        res.status(500).json({ message: 'Failed to generate speech', error: error.message });
    }
};

exports.speechToText = async (req, res) => {
    try {
        console.log("file", req.file);
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        console.log(req.file);
        const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            {
                model: 'whisper-1',
                file: fs.createReadStream(req.file.path),
                response_format: 'json',
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        console.log(response);
        return res.status(200).json({ message: 'success', data: response.data });
    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
        res.status(500).json({ message: 'Failed to generate speech', error: error.message });
    }
}

exports.endInterviewandStoreInteractions = async (req, res) => {
    try {
        // console.log("endInterviewandStoreInteractions",req.body);
        const responseMessage = await axios.post(
            `https://api.openai.com/v1/threads/${req.body.thread_id}/messages`,
            {
                role: "user",
                content: "analyze my performance and give me the result on my mock interview"
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );

        const responseTwo = await axios.post(
            `https://api.openai.com/v1/threads/${req.body.thread_id}/runs`,
            {
                assistant_id: req.body.assistantId,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                    "Content-Type": "application/json",
                    "OpenAI-Beta": "assistants=v2"
                },
            }
        );

        const checkRunStatus = async () => {
            try {
                const responseThree = await axios.get(
                    `https://api.openai.com/v1/threads/${req.body.thread_id}/runs/${responseTwo.data.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.GPT_API_KEY_AI}`,
                            "Content-Type": "application/json",
                            "OpenAI-Beta": "assistants=v2"
                        },
                    }
                );
                let runData = responseThree.data;
                // console.log(runData);
                // console.log("Run Status:", runData.status);

                if (runData.status === 'completed') {
                    // When the run is completed, get the messages
                    const messagesResponse = await axios.get(`https://api.openai.com/v1/threads/${req.body.thread_id}/messages`, {
                        headers: {
                            'Authorization': `Bearer ${process.env.GPT_API_KEY_AI}`,
                            'Content-Type': 'application/json',
                            'OpenAI-Beta': 'assistants=v2'
                        }
                    });

                    console.log("Assistant Response:", messagesResponse.data);

                    const aiMockInterview = new AiMockInterview({
                        user_id: req.body.user_id,
                        thread_id: req.body.thread_id,
                        assistant_id: req.body.assistantId,
                        conversation: messagesResponse.data.data
                    });
                    await aiMockInterview.save();

                    return res.status(200).json({ message: "success", data: messagesResponse.data ,aiMockInterviewResult:messagesResponse.data.data[0].content[0].text.value});
                } else {
                    console.log('Run is still in progress. Status:', runData.status);
                    // Poll again in a few seconds
                    setTimeout(checkRunStatus, 5000);  // Poll every 5 seconds
                }
            } catch (error) {
                console.error('Error fetching run status:', error);
                res.status(500).json({ message: 'Failed to fetch run status', error: error.message });
            }
        };

        // Start polling the run status
        checkRunStatus();

    } catch (error) {
        console.error('Error fetching ChatGPT response:', error);
        res.status(500).json({ message: 'Failed to fetch ChatGPT response', error: error.message });
    }
};
