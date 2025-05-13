/**
 * A simple response generator that doesn't rely on external APIs
 */

/**
 * Clean text by removing markdown, code blocks, and other formatting
 * @param {string} text - The text to clean
 * @returns {string} - The cleaned text
 */
function cleanText(text) {
  // Remove code blocks
  let cleaned = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  cleaned = cleaned.replace(/`[^`]*`/g, '');
  
  // Remove markdown headers
  cleaned = cleaned.replace(/#{1,6}\s+/g, '');
  
  // Remove markdown bold/italic
  cleaned = cleaned.replace(/\*\*|\*|__|\|_/g, '');
  
  // Remove bullet points
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
  
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Extract the most relevant sentences from a text based on keywords
 * @param {string} text - The text to extract sentences from
 * @param {string[]} keywords - The keywords to match
 * @returns {string[]} - The extracted sentences
 */
function extractRelevantSentences(text, keywords) {
  // Split text into sentences
  const sentences = text.split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200);
  
  // Score each sentence based on keyword matches
  const scoredSentences = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      if (lowerSentence.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    return { sentence, score };
  });
  
  // Sort by score and take top sentences
  return scoredSentences
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.sentence);
}

/**
 * Generate a simple response based on the query and content
 * @param {string} query - The user's query
 * @param {string[]} content - Array of content pieces
 * @returns {string} - The generated response
 */
export function generateSimpleResponse(query, content) {
  // Extract keywords from the query
  const keywords = query.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['what', 'when', 'where', 'which', 'who', 'how', 'tell', 'about', 'does', 'is', 'are', 'was', 'were', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'have', 'has', 'had', 'having', 'been', 'being', 'that', 'this', 'these', 'those', 'there', 'their', 'they', 'them', 'then', 'than', 'from', 'with', 'without', 'within', 'into', 'onto', 'upon', 'above', 'below', 'between', 'among', 'through', 'throughout', 'during', 'before', 'after', 'since', 'until', 'while', 'because', 'although', 'though', 'even', 'still', 'yet', 'however', 'nevertheless', 'nonetheless', 'therefore', 'thus', 'hence', 'consequently', 'accordingly', 'instead', 'rather', 'also', 'too', 'moreover', 'furthermore', 'additionally', 'besides', 'likewise', 'similarly', 'indeed', 'certainly', 'surely', 'actually', 'really', 'truly', 'basically', 'essentially', 'simply', 'just', 'only', 'merely', 'exactly', 'precisely', 'specifically', 'particularly', 'especially', 'notably', 'primarily', 'mainly', 'mostly', 'largely', 'generally', 'usually', 'typically', 'often', 'frequently', 'occasionally', 'sometimes', 'rarely', 'seldom', 'never', 'always', 'ever', 'never', 'almost', 'nearly', 'approximately', 'about', 'around', 'roughly', 'exactly', 'precisely', 'just', 'only', 'merely', 'simply', 'quite', 'rather', 'somewhat', 'fairly', 'pretty', 'very', 'extremely', 'incredibly', 'amazingly', 'surprisingly', 'remarkably', 'exceptionally', 'extraordinarily', 'tremendously', 'enormously', 'hugely', 'vastly', 'immensely', 'intensely', 'profoundly', 'deeply', 'thoroughly', 'completely', 'entirely', 'totally', 'wholly', 'fully', 'absolutely', 'perfectly', 'utterly', 'altogether', 'overall', 'generally', 'broadly', 'widely', 'extensively', 'comprehensively', 'universally', 'globally', 'internationally', 'nationally', 'locally', 'regionally', 'personally', 'individually', 'collectively', 'jointly', 'mutually', 'reciprocally', 'respectively', 'separately', 'independently', 'dependently', 'relatively', 'comparatively', 'proportionally', 'accordingly', 'consequently', 'subsequently', 'eventually', 'ultimately', 'finally', 'lastly', 'firstly', 'secondly', 'thirdly', 'next', 'then', 'afterwards', 'later', 'earlier', 'previously', 'formerly', 'initially', 'originally', 'recently', 'lately', 'currently', 'presently', 'now', 'immediately', 'instantly', 'suddenly', 'abruptly', 'gradually', 'progressively', 'incrementally', 'steadily', 'consistently', 'constantly', 'continually', 'continuously', 'persistently', 'repeatedly', 'frequently', 'regularly', 'routinely', 'habitually', 'customarily', 'traditionally', 'conventionally', 'commonly', 'normally', 'ordinarily', 'naturally', 'obviously', 'evidently', 'apparently', 'seemingly', 'ostensibly', 'supposedly', 'allegedly', 'reputedly', 'reportedly', 'presumably', 'likely', 'probably', 'possibly', 'perhaps', 'maybe', 'conceivably', 'imaginably', 'feasibly', 'plausibly', 'credibly', 'believably', 'undoubtedly', 'unquestionably', 'indisputably', 'indubitably', 'undeniably', 'irrefutably', 'incontrovertibly', 'incontestably', 'unequivocally', 'definitely', 'certainly', 'surely', 'assuredly', 'decidedly', 'positively', 'absolutely', 'completely', 'totally', 'entirely', 'wholly', 'fully', 'thoroughly', 'utterly', 'perfectly', 'precisely', 'exactly', 'specifically', 'particularly', 'especially', 'notably', 'remarkably', 'significantly', 'substantially', 'considerably', 'appreciably', 'markedly', 'noticeably', 'detectably', 'perceptibly', 'visibly', 'obviously', 'clearly', 'plainly', 'evidently', 'manifestly', 'patently', 'openly', 'explicitly', 'expressly', 'directly', 'straightforwardly', 'unambiguously', 'unmistakably', 'unequivocally', 'categorically', 'definitively', 'conclusively', 'decisively', 'finally', 'ultimately', 'eventually', 'subsequently', 'consequently', 'accordingly', 'therefore', 'thus', 'hence', 'ergo', 'so', 'then', 'that', 'this', 'these', 'those', 'such', 'which', 'who', 'whom', 'whose', 'what', 'whatever', 'whichever', 'whoever', 'whomever', 'when', 'whenever', 'where', 'wherever', 'why', 'how', 'however', 'whatever', 'whatsoever', 'whichever', 'whoever', 'whomever', 'whenever', 'wherever', 'however', 'howsoever', 'whyever', 'wheresoever', 'whensoever', 'whosoever', 'whomsoever', 'whatsoever', 'whichsoever', 'howsoever', 'whysoever', 'wheresoever', 'whensoever'].includes(word));
  
  // If no keywords found, use the whole query
  if (keywords.length === 0) {
    keywords.push(...query.toLowerCase().split(/\s+/).filter(word => word.length > 3));
  }
  
  // If still no keywords, use some default keywords
  if (keywords.length === 0) {
    if (query.toLowerCase().includes('roadmap')) {
      keywords.push('roadmap', 'immigration', 'process', 'steps');
    } else if (query.toLowerCase().includes('cost')) {
      keywords.push('cost', 'price', 'fee', 'subscription');
    } else if (query.toLowerCase().includes('visafy')) {
      keywords.push('visafy', 'platform', 'service');
    } else {
      keywords.push('immigration', 'visa', 'process');
    }
  }
  
  console.log('Keywords:', keywords);
  
  // Clean the content
  const cleanedContent = content.map(cleanText);
  
  // Extract relevant sentences from each content piece
  let allRelevantSentences = [];
  
  cleanedContent.forEach(text => {
    const sentences = extractRelevantSentences(text, keywords);
    allRelevantSentences.push(...sentences);
  });
  
  // Remove duplicates
  allRelevantSentences = [...new Set(allRelevantSentences)];
  
  // If no relevant sentences found
  if (allRelevantSentences.length === 0) {
    return `I don't have specific information about "${query}" in my knowledge base. Please try asking a different question about Visafy or immigration programs.`;
  }
  
  // Format the response
  let response = `Here's what I know about "${query}":\n\n`;
  
  allRelevantSentences.slice(0, 5).forEach((sentence, index) => {
    response += `${index + 1}. ${sentence}.\n\n`;
  });
  
  return response;
}
