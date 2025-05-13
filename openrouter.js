// OpenRouter API integration
import fetch from 'node-fetch';

/**
 * Generate a response using OpenRouter API
 * @param {string} prompt - The prompt to send to the model
 * @param {string} context - The context to include in the prompt
 * @returns {Promise<string>} - The generated response
 */
export async function generateResponse(prompt, context = '') {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not set in environment variables');
    }

    console.log(`Generating response for prompt: "${prompt.substring(0, 50)}..."`);

    // Prepare the messages
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that answers questions about websites and immigration programs. ' +
                'Your answers should be based on the provided context. If the context doesn\'t contain ' +
                'relevant information, politely say so and suggest what the user might ask instead.'
      }
    ];

    // Add context if available
    if (context && context.trim()) {
      messages.push({
        role: 'system',
        content: `Here is the context information to use when answering the question:\n\n${context}`
      });
    }

    // Add the user's question
    messages.push({
      role: 'user',
      content: prompt
    });

    // Make the API request
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://visafy.com', // Your site URL
        'X-Title': 'Visafy Chatbot' // Your app name
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // Using a free model
        messages: messages,
        transforms: ["middle-out"], // Use middle-out compression to reduce token usage
        route: "fallback" // Use fallback routing to find available models
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    console.log(`Generated response: "${answer.substring(0, 50)}..."`);
    return answer;
  } catch (error) {
    console.error('Error generating response:', error);

    // Fallback to a simple response without using OpenRouter
    try {
      console.log('Using fallback response generation');

      // Extract the main question from the prompt
      const questionMatch = prompt.match(/The user is asking: "([^"]+)"/);
      const question = questionMatch ? questionMatch[1] : prompt;

      // Generate a simple response based on the context
      if (context && context.trim()) {
        // If we have context, use it to create a simple response
        const relevantParts = context
          .split('\n\n')
          .filter(part => {
            const partLower = part.toLowerCase();
            const questionLower = question.toLowerCase();

            // Check if this part is relevant to the question
            return questionLower.split(' ').some(word =>
              word.length > 3 && partLower.includes(word.toLowerCase())
            );
          })
          .slice(0, 3) // Take up to 3 most relevant parts
          .join('\n\n');

        if (relevantParts) {
          return `Based on the information I have:\n\n${relevantParts}\n\nThis is what I found related to your question. If you need more specific information, please ask a more targeted question.`;
        }
      }

      // If no context or no relevant parts found
      return `I don't have specific information about "${question}" in my knowledge base. This might be because the content wasn't covered in the websites I've been trained on, or the question might be using different terminology than what's in my database. Please try rephrasing your question or ask about a different topic.`;
    } catch (fallbackError) {
      console.error('Error in fallback response generation:', fallbackError);
      return `I'm sorry, I encountered an error while trying to generate a response. Please try again later.`;
    }
  }
}
