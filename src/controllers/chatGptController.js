const axios = require("axios");
const cheerio = require('cheerio');

// Function to extract text from HTML
const extractTextFromHTML = (html) => {
  const $ = cheerio.load(html);
  let text = '';
  $('body').each((i, el) => {
      text += $(el).text() + ' ';
  });
  return text;
};

const API_KEY =process.env.GPT_API_KEY
 
const API_URL = "https://api.openai.com/v1/chat/completions";

exports.getChatGPTResponse = async (req,res) => {
  try {
    console.log("api Called",req.body)
    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-3.5-turbo',  // Or use GPT-3.5 if you're using a lower version
        messages: [{ role: "user", content: `Summarize the following text:\n\n${extractTextFromHTML(req.body.message)}` }],
        max_tokens: 150,  // Adjust max tokens as per your requirement
        temperature: 0.7, // Adjust the creativity of the summary
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
    return res.status(500).json({ message: "Failed to fetch ChatGPT response", error: error.message });
  }
};
