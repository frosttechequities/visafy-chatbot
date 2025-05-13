import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to test a Gemini API key
async function testGeminiKey(apiKey) {
  try {
    console.log(`Testing API key: ${apiKey.substring(0, 10)}...`);

    // Initialize the Gemini model with the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Use gemini-pro instead of gemini-1.5-pro

    // Try to generate content with a simple prompt
    const result = await model.generateContent("Hello, are you working?");
    const response = result.response;
    const text = response.text();

    console.log(`✅ API key works! Response: "${text.substring(0, 50)}..."`);
    return true;
  } catch (error) {
    console.error(`❌ API key failed: ${error.message}`);
    return false;
  }
}

// API keys to test
const apiKeys = [
  "AIzaSyBqnwvIXv8UKnJW-znoofp-abTGzDyKU6k",
  "AIzaSyA-NsWOhbcwqBognOgdmQvLMiP0EE5IUMQ",
  "AIzaSyAHKwFIUbmak7aFLOaW6Y9h0SlPrnrkb8s"
];

// Test each API key
async function testAllKeys() {
  for (const apiKey of apiKeys) {
    const works = await testGeminiKey(apiKey);
    if (works) {
      console.log(`Found working API key: ${apiKey}`);
      return apiKey;
    }
  }
  console.log("None of the API keys work.");
  return null;
}

// Run the tests
testAllKeys().then(workingKey => {
  if (workingKey) {
    console.log(`Use this key in your .env file: GEMINI_API_KEY=${workingKey}`);
  }
});
