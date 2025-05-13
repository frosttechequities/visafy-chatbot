import store from "./simpleStore.js";
import { generateSimpleResponse } from "./simpleResponse.js";

/**
 * Ask a question to the AI chatbot.
 * @param {string} input - The question to ask.
 * @returns {Promise<string>} - The answer from the chatbot.
 */
export async function question(input) {
  console.log(`Question: ${input}`);

  try {
    // Get list of websites the chatbot has been trained on
    const trainedWebsites = store.getWebsites();
    console.log("Trained websites:", trainedWebsites);

    // Check if the query is about a specific website
    const isAboutWebsite = (
      input.toLowerCase().includes('about') ||
      input.toLowerCase().includes('learned') ||
      input.toLowerCase().includes('know') ||
      input.toLowerCase().includes('tell me')
    ) && (
      input.toLowerCase().includes('.com') ||
      input.toLowerCase().includes('.to') ||
      input.toLowerCase().includes('visafy') ||
      input.toLowerCase().includes('supernova')
    );

    if (isAboutWebsite) {
      // Extract website name
      let websiteName = '';

      if (input.toLowerCase().includes('visafy')) {
        websiteName = 'visafy.com';
      } else if (input.toLowerCase().includes('supernova')) {
        websiteName = 'supernova.to';
      } else {
        const match = input.match(/(?:about|from|learned|know)\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (match) {
          websiteName = match[1];
        }
      }

      // Check if the website is in the trained websites list
      const isWebsiteTrained = trainedWebsites.some(site => {
        const normalizedSite = site.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const normalizedWebsiteName = websiteName.replace(/^https?:\/\//, '').replace(/\/$/, '');
        return normalizedSite.includes(normalizedWebsiteName) || normalizedWebsiteName.includes(normalizedSite);
      });

      if (!isWebsiteTrained) {
        return `I haven't been trained on ${websiteName}. I only have information about websites I've been trained on, which currently include: ${trainedWebsites.join(', ')}. Please train me on ${websiteName} first if you want me to answer questions about it.`;
      }

      if (websiteName) {
        console.log(`Query is about website: ${websiteName}`);
        const websiteContent = store.getWebsiteContent(websiteName);

        if (websiteContent && websiteContent.length > 0) {
          console.log(`Found ${websiteContent.length} content pieces for ${websiteName}`);
          return generateSimpleResponse(input, websiteContent);
        }
      }
    }

    // For regular queries, search for relevant content
    const results = store.search(input);
    console.log(`Found ${results.length} relevant documents for query: "${input}"`);

    if (results.length > 0) {
      return generateSimpleResponse(input, results);
    } else {
      // No relevant documents found
      return `I don't have specific information about "${input}" in my knowledge base.

This might be because:
1. The content wasn't covered in the websites I've been trained on
2. The question might be using different terminology than what's in my database

Please try:
- Rephrasing your question
- Training me on a website that contains this information
- Asking about a different topic`;
    }
  } catch (error) {
    console.error("Error asking question:", error);
    return "I'm sorry, I encountered an error while trying to answer your question. Please try again later or ask a different question.";
  }
}
