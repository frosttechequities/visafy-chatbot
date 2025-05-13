// Simple in-memory document store

// Simple document store with basic search functionality
class SimpleDocumentStore {
  constructor() {
    this.documents = [];
  }

  // Add documents to the store
  async addDocuments(docs) {
    for (const doc of docs) {
      this.documents.push({
        pageContent: doc.pageContent,
        metadata: doc.metadata
      });
    }
    console.log(`Added ${docs.length} documents to the store. Total: ${this.documents.length}`);
    return this.documents.length;
  }

  // Create a retriever
  asRetriever() {
    return {
      getRelevantDocuments: async (query) => {
        console.log(`Searching for: "${query}"`);

        // Log all documents for debugging
        console.log(`Total documents in store: ${this.documents.length}`);
        this.documents.forEach((doc, index) => {
          console.log(`Document ${index}: ${doc.pageContent.substring(0, 100)}...`);
        });

        // Enhanced keyword-based search
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/);

        // Extract important terms from the query
        const importantTerms = queryWords.filter(word =>
          word.length > 2 &&
          !['the', 'and', 'for', 'you', 'all', 'about', 'tell', 'what', 'who', 'how', 'why', 'when', 'where'].includes(word)
        );

        console.log(`Important search terms: ${importantTerms.join(', ')}`);

        if (importantTerms.length === 0) {
          // If no important terms, return all documents
          console.log("No important search terms found, returning all documents");
          return this.documents.slice(0, 5);
        }

        // Score each document based on keyword matches
        const scoredDocs = this.documents.map(doc => {
          const content = doc.pageContent.toLowerCase();
          let score = 0;

          // Check for exact query match (highest score)
          if (content.includes(queryLower)) {
            score += 100;
          }

          // Extract domain names from the documents metadata if available
          if (doc.metadata && doc.metadata.source) {
            try {
              const url = new URL(doc.metadata.source);
              const domain = url.hostname.replace('www.', '');

              // Check if the query contains the domain name
              if (queryLower.includes(domain) && content.includes(domain)) {
                score += 50;
                console.log(`Domain match found: ${domain}`);
              }
            } catch (e) {
              // Not a valid URL, ignore
            }
          }

          // Hardcoded domains for backward compatibility
          if (queryLower.includes('visafy') && content.includes('visafy')) {
            score += 50;
          }

          if (queryLower.includes('supernova') && content.includes('supernova')) {
            score += 50;
          }

          // Count keyword occurrences with partial matching
          for (const term of importantTerms) {
            // Full word match
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            const matches = content.match(regex);
            if (matches) {
              score += matches.length * 10;
            }

            // Partial match
            if (content.includes(term)) {
              score += 5;
            }
          }

          return { doc, score };
        });

        // Sort by score and take top 5
        const topDocs = scoredDocs
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .filter(item => item.score > 0)
          .map(item => item.doc);

        console.log(`Found ${topDocs.length} relevant documents for query: "${query}"`);

        // If no matches found, return the first few documents as fallback
        if (topDocs.length === 0 && this.documents.length > 0) {
          console.log("No matches found, returning first few documents as fallback");
          return this.documents.slice(0, 3);
        }

        return topDocs;
      }
    };
  }
}

// Function to load the document store
export async function loadVectorStore() {
  return new SimpleDocumentStore();
}

// Export a dummy embeddings object for compatibility
export const embeddings = {
  embedQuery: async () => [],
  embedDocuments: async () => []
};
