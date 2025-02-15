import axios from "axios";

const API_KEY =process.env.GPT_API_KEY
 
const API_URL = "https://api.openai.com/v1/chat/completions";

export const getChatGPTResponse = async (message) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4", // or "gpt-3.5-turbo"
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching ChatGPT response:", error);
    return "Something went wrong.";
  }
};
