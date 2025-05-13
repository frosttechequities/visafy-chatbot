// Test script for OpenRouter API
import fetch from 'node-fetch';

async function testOpenRouterKey(apiKey) {
  try {
    console.log(`Testing OpenRouter API key: ${apiKey.substring(0, 15)}...`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://visafy.com', // Your site URL
        'X-Title': 'Visafy Chatbot' // Your app name
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku', // Using Claude 3 Haiku as it's fast and affordable
        messages: [
          { role: 'user', content: 'Hello, are you working?' }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    console.log(`✅ API key works! Response: "${data.choices[0].message.content.substring(0, 50)}..."`);
    return true;
  } catch (error) {
    console.error(`❌ API key failed: ${error.message}`);
    return false;
  }
}

// API keys to test
const apiKeys = [
  "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",
  "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",
  "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"
];

// Test each API key
async function testAllKeys() {
  for (const apiKey of apiKeys) {
    const works = await testOpenRouterKey(apiKey);
    if (works) {
      console.log(`Found working API key: ${apiKey.substring(0, 15)}...`);
      return apiKey;
    }
  }
  console.log("None of the API keys work.");
  return null;
}

// Run the tests
testAllKeys().then(workingKey => {
  if (workingKey) {
    console.log(`Use this key in your .env file: OPENROUTER_API_KEY=${workingKey}`);
  }
});
