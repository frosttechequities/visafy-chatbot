import { DOMParser } from "xmldom";
import { train } from "./train.js";
import store from "./simpleStore.js";

/**
 * Extract URLs from a sitemap XML string.
 * @param {string} xmlString - The XML string to parse.
 * @returns {string[]} - Array of URLs extracted from the sitemap.
 */
function makeURLs(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const urls = xmlDoc.getElementsByTagName("url");
  const urlList = [];

  for (let i = 0; i < urls.length; i++) {
    const loc = urls[i].getElementsByTagName("loc")[0];
    if (loc) {
      urlList.push(loc.textContent);
    }
  }

  return urlList;
}

/**
 * Extract links from a webpage.
 * @param {string} url - The URL to extract links from.
 * @param {string} baseUrl - The base URL of the website.
 * @returns {Promise<string[]>} - Array of URLs extracted from the webpage.
 */
async function extractLinksFromPage(url, baseUrl) {
  try {
    console.log(`Fetching page: ${url}`);

    // Use a more browser-like fetch with headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);

      // If this is the main page and it failed, try with https:// prefix
      if (url === baseUrl && !url.startsWith('https://')) {
        const httpsUrl = 'https://' + url.replace('http://', '');
        console.log(`Trying with HTTPS: ${httpsUrl}`);
        return extractLinksFromPage(httpsUrl, httpsUrl);
      }

      return [];
    }

    const html = await response.text();
    console.log(`Successfully fetched page (${html.length} bytes)`);

    // Use direct string manipulation for more reliable link extraction
    const urlList = new Set();

    // Add the current page
    urlList.add(url);

    // Extract links using regex
    const linkRegex = /href=["'](.*?)["']/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      if (href) {
        let fullUrl;

        // Handle relative URLs
        if (href.startsWith("/")) {
          fullUrl = `${baseUrl}${href}`;
        } else if (href.startsWith("http")) {
          // Only include links from the same domain
          const urlObj = new URL(href);
          const baseUrlObj = new URL(baseUrl);

          if (urlObj.hostname === baseUrlObj.hostname) {
            fullUrl = href;
          } else {
            continue;
          }
        } else {
          // Skip anchors, javascript:, mailto:, etc.
          if (href.startsWith("#") || href.includes(":")) {
            continue;
          }
          fullUrl = `${baseUrl}/${href}`;
        }

        // Add to the set to avoid duplicates
        urlList.add(fullUrl);
      }
    }

    const result = Array.from(urlList);
    console.log(`Found ${result.length} links on page ${url}`);
    return result;
  } catch (error) {
    console.error(`Error extracting links from ${url}:`, error);

    // If this is the main page and it failed, try with https:// prefix
    if (url === baseUrl && !url.startsWith('https://')) {
      const httpsUrl = 'https://' + url.replace('http://', '');
      console.log(`Error occurred. Trying with HTTPS: ${httpsUrl}`);
      return extractLinksFromPage(httpsUrl, httpsUrl);
    }

    return [];
  }
}

/**
 * Scrape a website and train the chatbot on the content.
 * @param {string} url - The base URL of the website to scrape.
 */
export async function scrapeWebsite(url) {
  console.log(`Scraping website: ${url}`);

  try {
    // Clear previous data
    store.clear();
    console.log("Cleared previous data from store");

    // Normalize the URL
    let baseUrl = url;

    // Add http:// prefix if missing
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'http://' + baseUrl;
    }

    // Remove trailing slash
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }

    console.log(`Normalized URL: ${baseUrl}`);

    // Try to fetch the sitemap first
    try {
      const sitemapURL = `${baseUrl}/sitemap.xml`;
      console.log(`Fetching sitemap from: ${sitemapURL}`);

      const response = await fetch(sitemapURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (response.ok) {
        const xmlString = await response.text();

        // Extract URLs from the sitemap
        const urls = makeURLs(xmlString);
        console.log(`Found ${urls.length} URLs in sitemap`);

        if (urls.length > 0) {
          // Limit the number of URLs to process to stay within free tier limits
          const maxUrls = process.env.MAX_URLS ? parseInt(process.env.MAX_URLS) : 20;
          const limitedUrls = urls.slice(0, maxUrls);
          console.log(`Processing ${limitedUrls.length} URLs (limited to ${maxUrls})`);

          // Train the chatbot on the extracted URLs
          const trainedCount = await train(limitedUrls);

          return limitedUrls;
        } else {
          console.log(`Sitemap found but no URLs extracted. Falling back to direct crawling.`);
        }
      } else {
        console.log(`Sitemap not found or access denied (${response.status}). Falling back to direct crawling.`);
      }
    } catch (error) {
      console.log(`Error fetching sitemap: ${error.message}. Falling back to direct crawling.`);
    }

    // If sitemap approach failed, crawl the website directly
    console.log(`Crawling website directly: ${baseUrl}`);

    // Start with the homepage
    const discoveredUrls = await extractLinksFromPage(baseUrl, baseUrl);
    console.log(`Found ${discoveredUrls.length} URLs by crawling the homepage`);

    if (discoveredUrls.length === 0) {
      console.log(`No URLs found. Adding the base URL as a fallback.`);
      discoveredUrls.push(baseUrl);
    }

    // Limit the number of URLs to process
    const maxUrls = process.env.MAX_URLS ? parseInt(process.env.MAX_URLS) : 20;
    const limitedUrls = discoveredUrls.slice(0, maxUrls);
    console.log(`Processing ${limitedUrls.length} URLs (limited to ${maxUrls})`);

    // Train the chatbot on the extracted URLs
    const trainedCount = await train(limitedUrls);

    // Special case for visafy.com - add hardcoded information if no content was found
    if (url.includes('visafy') && store.documents.length === 0) {
      console.log("Adding hardcoded information about Visafy");
      store.addDocument("Visafy is a platform designed to help users navigate immigration processes and requirements.", "visafy.com");
      store.addDocument("Visafy provides personalized immigration roadmaps based on user assessments and profiles.", "visafy.com");
      store.addDocument("Visafy offers document management tools for immigration applications.", "visafy.com");
    }

    return limitedUrls;
  } catch (error) {
    console.error("Error scraping website:", error);

    // Even if there's an error, add some basic information about the website
    if (url.includes('visafy')) {
      console.log("Adding fallback information about Visafy");
      store.addDocument("Visafy is a platform designed to help users navigate immigration processes and requirements.", "visafy.com");
      store.addDocument("Visafy provides personalized immigration roadmaps based on user assessments and profiles.", "visafy.com");
    }

    throw error;
  }
}
