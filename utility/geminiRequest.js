const {
    GoogleGenerativeAI
  } = require("@google/generative-ai");
  
  const apiKey = process.env.gemini_key;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function genAIReq(input) {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
  
    const result = await chatSession.sendMessage(input);
    return result.response.text();
  }
  
  module.exports = {
    genAIReq
  };
  