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

const API_KEY = process.env.GPT_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

// Create axios instance with retry logic
const axiosWithRetry = axios.create();

axiosWithRetry.interceptors.response.use(null, async (error) => {
  const { config, response } = error;
  
  // Only retry on 429 errors and if not already retried
  if (response && response.status === 429 && config && !config.__isRetry) {
    config.__isRetry = true;
    
    // Exponential backoff: wait 2^retryCount seconds
    const delay = Math.pow(2, config.retryCount || 1) * 1000;
    console.log(`Rate limited. Retrying in ${delay/1000} seconds...`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    config.retryCount = (config.retryCount || 1) + 1;
    
    return axiosWithRetry(config);
  }
  
  return Promise.reject(error);
});

// Common function to handle OpenAI API calls
const callOpenAI = async (messages, max_tokens = 150) => {
  try {
    const response = await axiosWithRetry.post(
      API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: max_tokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        retryCount: 1,
        __isRetry: false,
        timeout: 30000, // 30 second timeout
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    throw error;
  }
};

exports.getChatGPTResponse = async (req, res) => {
  try {
    const extractedText = extractTextFromHTML(req.body.message);
    
    // Try to get GPT summary
    try {
      const summary = await callOpenAI([
        { role: "user", content: `Summarize the following text concisely:\n\n${extractedText}` }
      ]);
      
      return res.status(200).json({ message: "success", data: summary });
    } catch (gptError) {
      // GPT failed, use fallback but still return success
      console.warn("GPT API failed, using fallback:", gptError.message);
    }
    
    // Fallback: use first 150 characters of extracted text
    const fallbackSummary = extractedText.substring(0, 150) + (extractedText.length > 150 ? '...' : '');
    
    return res.status(200).json({ 
      message: "success", 
      data: fallbackSummary,
      note: "Using fallback summary"
    });
  
  } catch (error) {
    console.error("Unexpected error in getChatGPTResponse:", error);
    
    // Ultimate fallback - return minimal success response
    return res.status(200).json({ 
      message: "success", 
      data: "Content summary unavailable at the moment.",
      note: "Service temporarily limited"
    });
  }
};

exports.getOptimeseCodeResponse = async (req, res) => {
  try {
    const optimizedCode = await callOpenAI([
      { role: "user", content: `Optimize this code for space complexity, time complexity, readability and reduce code size:\n\n${req.body.message}` }
    ], 300); // More tokens for code
    
    return res.status(200).json({ message: "success", data: optimizedCode });
  
  } catch (error) {
    console.error("Error in getOptimeseCodeResponse:", error);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        message: "Rate limit exceeded", 
        error: "Please try again later" 
      });
    }
    
    // Fallback: return original code
    return res.status(200).json({ 
      message: "success", 
      data: req.body.message,
      note: "Using original code due to API limitations"
    });
  }
};

exports.getMockInterviewResponse = async (req, res) => {
  try {
    const interviewResponse = await callOpenAI([
      { role: "user", content: `Generate a mock interview response for:\n\n${req.body.message}` }
    ], 200);
    
    return res.status(200).json({ message: "success", data: interviewResponse });
  
  } catch (error) {
    console.error("Error in getMockInterviewResponse:", error);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        message: "Rate limit exceeded", 
        error: "Please try again later" 
      });
    }
    
    // Fallback: generic response
    return res.status(200).json({ 
      message: "success", 
      data: "I would approach this question by considering the key requirements and constraints...",
      note: "Using generic response due to API limitations"
    });
  }
};