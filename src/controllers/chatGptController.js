const axios = require("axios");

const API_KEY =process.env.GPT_API_KEY
 
const API_URL = "https://api.openai.com/v1/chat/completions";

exports.getChatGPTResponse = async (req,res) => {
  try {
    console.log("api Called",req.body)
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4", // or "gpt-3.5-turbo"
        messages: [{ role: "user", content: req.body.message }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    // return response.data.choices[0].message.content;
   return res.status(200).json({message:"success",data:response.data.choices[0].message.content});
  } catch (error) {
    console.error("Error fetching ChatGPT response:", error);
    return "Something went wrong.";
  }
};
