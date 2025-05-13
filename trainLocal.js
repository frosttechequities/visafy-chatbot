import fs from 'fs';
import path from 'path';
import store from './simpleStore.js';

/**
 * Get all files in a directory recursively
 * @param {string} dirPath - Path to the directory
 * @param {Array} arrayOfFiles - Array to store file paths
 * @returns {Array} - Array of file paths
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Read file content
 * @param {string} filePath - Path to the file
 * @returns {string} - File content
 */
function readFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return '';
  }
}

/**
 * Train the chatbot on local files
 * @param {string} dirPath - Path to the directory containing files
 * @returns {Promise<number>} - Number of files processed
 */
export async function trainOnLocalFiles(dirPath) {
  console.log(`Training on local files in ${dirPath}`);
  
  try {
    // Clear previous data
    store.clear();
    console.log("Cleared previous data from store");
    
    // Get all files in the directory
    const files = getAllFiles(dirPath);
    console.log(`Found ${files.length} files in ${dirPath}`);
    
    // Process each file
    let processedCount = 0;
    
    for (const filePath of files) {
      try {
        // Skip non-text files
        const ext = path.extname(filePath).toLowerCase();
        const textExtensions = ['.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.yml', '.yaml', '.csv', '.xml'];
        
        if (!textExtensions.includes(ext)) {
          console.log(`Skipping non-text file: ${filePath}`);
          continue;
        }
        
        console.log(`Processing ${filePath}`);
        
        // Read file content
        const content = readFileContent(filePath);
        
        if (!content) {
          console.log(`Empty or unreadable file: ${filePath}`);
          continue;
        }
        
        // Split content into chunks
        const chunks = [];
        const chunkSize = 1000;
        
        for (let i = 0; i < content.length; i += chunkSize) {
          chunks.push(content.slice(i, i + chunkSize));
        }
        
        // Add each chunk to the store
        chunks.forEach(chunk => {
          if (chunk.trim()) {
            // Use the file path as the source
            store.addDocument(chunk, 'visafy.com/project-plan/' + path.basename(filePath));
          }
        });
        
        console.log(`Added ${chunks.length} document chunks from ${filePath}`);
        processedCount++;
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }
    
    console.log(`Training complete! Processed ${processedCount} files.`);
    console.log("Websites in store:", store.getWebsites());
    
    // Add some hardcoded information about Visafy
    store.addDocument("Visafy is a platform designed to help users navigate immigration processes and requirements.", "visafy.com");
    store.addDocument("Visafy provides personalized immigration roadmaps based on user assessments and profiles.", "visafy.com");
    store.addDocument("Visafy offers document management tools for immigration applications.", "visafy.com");
    
    return processedCount;
  } catch (error) {
    console.error("Error training on local files:", error);
    throw error;
  }
}
