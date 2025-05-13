import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import store from "./simpleStore.js";

/**
 * Train the AI chatbot on the content of the provided URLs.
 * @param {string[]} urls - Array of URLs to scrape and train on.
 */
export async function train(urls) {
  console.log("Training on URLs:", urls);

  // Process each URL
  for (const url of urls) {
    try {
      console.log(`Processing ${url}`);

      // Load the webpage using fetch directly for more reliable results
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      console.log(`Fetched ${url}, content length: ${html.length} bytes`);

      // Use CheerioWebBaseLoader as a fallback
      let content = '';

      try {
        // Use regex to extract text content from HTML
        // Remove script tags
        let cleanedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        // Remove style tags
        cleanedHtml = cleanedHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        // Remove HTML tags
        content = cleanedHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      } catch (extractError) {
        console.error(`Error extracting content from HTML: ${extractError.message}`);

        // Fallback to using CheerioWebBaseLoader
        try {
          const loader = new CheerioWebBaseLoader(url);
          const docs = await loader.load();
          content = docs.map(doc => doc.pageContent).join('\n\n');
        } catch (loaderError) {
          console.error(`Error using CheerioWebBaseLoader: ${loaderError.message}`);
          content = html; // Use raw HTML as last resort
        }
      }

      // Split the content into chunks
      const chunks = [];
      const chunkSize = 1000;

      for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.slice(i, i + chunkSize));
      }

      // Add each chunk to the store
      chunks.forEach(chunk => {
        if (chunk.trim()) {
          store.addDocument(chunk, url);
        }
      });

      console.log(`Added ${chunks.length} document chunks from ${url}`);

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
    }
  }

  console.log("Training complete!");
  console.log("Websites in store:", store.getWebsites());
  return urls.length;
}
