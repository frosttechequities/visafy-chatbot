/**
 * A simple document store that keeps everything in memory
 * and provides basic search functionality.
 */
class SimpleStore {
  constructor() {
    this.documents = [];
    this.websiteData = new Map(); // Map of website URLs to their content
  }

  /**
   * Add a document to the store
   * @param {string} content - The document content
   * @param {string} source - The source URL
   */
  addDocument(content, source) {
    // Normalize the source URL
    const normalizedSource = this._normalizeUrl(source);

    this.documents.push({
      content,
      source: normalizedSource
    });

    // Also store by website
    if (!this.websiteData.has(normalizedSource)) {
      this.websiteData.set(normalizedSource, []);
    }
    this.websiteData.get(normalizedSource).push(content);

    console.log(`Added document from ${normalizedSource}, total documents: ${this.documents.length}`);
  }

  /**
   * Add multiple documents to the store
   * @param {Array} docs - Array of document objects with content and source
   */
  addDocuments(docs) {
    for (const doc of docs) {
      this.addDocument(doc.content, doc.source);
    }
    return this.documents.length;
  }

  /**
   * Get all documents from a specific website
   * @param {string} website - The website URL
   * @returns {Array} - Array of document contents
   */
  getWebsiteContent(website) {
    // Normalize the website URL for comparison
    const normalizedWebsite = this._normalizeUrl(website);

    // Check for exact match first
    if (this.websiteData.has(normalizedWebsite)) {
      return this.websiteData.get(normalizedWebsite);
    }

    // Check for partial matches
    for (const [url, content] of this.websiteData.entries()) {
      if (url.includes(normalizedWebsite) || normalizedWebsite.includes(url)) {
        return content;
      }
    }

    // Check if any document source contains the website name
    const websiteName = this._extractDomainName(normalizedWebsite);
    const results = [];

    for (const doc of this.documents) {
      const docDomain = this._extractDomainName(doc.source);
      if (docDomain === websiteName) {
        results.push(doc.content);
      }
    }

    return results.length > 0 ? results : [];
  }

  /**
   * Search for documents matching a query
   * @param {string} query - The search query
   * @returns {Array} - Array of matching document contents
   */
  search(query) {
    const queryLower = query.toLowerCase();
    const results = [];

    // Check if query is about a specific website
    if (queryLower.includes('visafy.com') ||
        queryLower.includes('visafy') ||
        queryLower.includes('about visafy')) {
      const visafyContent = this.getWebsiteContent('visafy.com');
      if (visafyContent && visafyContent.length > 0) {
        return visafyContent;
      }
    }

    // Extract website name from query if present
    const websiteMatch = query.match(/about\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (websiteMatch) {
      const websiteName = websiteMatch[1];
      const websiteContent = this.getWebsiteContent(websiteName);
      if (websiteContent && websiteContent.length > 0) {
        return websiteContent;
      }
    }

    // General keyword search
    const keywords = queryLower.split(/\s+/).filter(word => word.length > 3);

    for (const doc of this.documents) {
      const contentLower = doc.content.toLowerCase();
      let matches = 0;

      for (const keyword of keywords) {
        if (contentLower.includes(keyword)) {
          matches++;
        }
      }

      if (matches > 0) {
        results.push({
          content: doc.content,
          matches,
          source: doc.source
        });
      }
    }

    // Sort by number of matches
    results.sort((a, b) => b.matches - a.matches);

    return results.map(r => r.content);
  }

  /**
   * Helper method to normalize URLs
   * @private
   */
  _normalizeUrl(url) {
    // Remove protocol
    let normalized = url.replace(/^https?:\/\//, '');
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    // Remove www.
    normalized = normalized.replace(/^www\./, '');
    return normalized;
  }

  /**
   * Helper method to extract domain name
   * @private
   */
  _extractDomainName(url) {
    const normalized = this._normalizeUrl(url);
    const parts = normalized.split('/')[0].split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2]; // Return the domain name without TLD
    }
    return normalized;
  }

  /**
   * Get all websites in the store
   * @returns {Array} - Array of website URLs
   */
  getWebsites() {
    return Array.from(this.websiteData.keys());
  }

  /**
   * Clear all documents
   */
  clear() {
    this.documents = [];
    this.websiteData.clear();
  }
}

// Singleton instance
const store = new SimpleStore();

export default store;
