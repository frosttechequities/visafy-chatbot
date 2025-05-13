import express from "express";
import { scrapeWebsite } from "./scrape.js";
import { question } from "./ask.js";
import { trainOnLocalFiles } from "./trainLocal.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Add CORS middleware
app.use((req, res, next) => {
  // Allow requests from our frontend
  const allowedOrigins = [
    'https://astonishing-smakager-d8c61d.netlify.app',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Define API routes
app.post("/api/scrape", async (req, res) => {
  try {
    const { url } = req.body;
    const urls = await scrapeWebsite(url);
    res.json({ success: true, urls });
  } catch (error) {
    console.error("Error scraping website:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/train-local", async (req, res) => {
  try {
    const { dirPath } = req.body;
    const fileCount = await trainOnLocalFiles(dirPath);
    res.json({ success: true, fileCount });
  } catch (error) {
    console.error("Error training on local files:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Original endpoint for backward compatibility
app.post("/api/ask", async (req, res) => {
  try {
    const { question: userQuestion } = req.body;
    const answer = await question(userQuestion);
    res.json({ success: true, answer });
  } catch (error) {
    console.error("Error asking question:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// New endpoint for the ChatbotWidget component
app.post("/ask", async (req, res) => {
  try {
    const { question: userQuestion } = req.body;
    const answer = await question(userQuestion);
    res.json({ success: true, answer });
  } catch (error) {
    console.error("Error asking question:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// If a default website is provided in environment variables, scrape it on startup
if (process.env.DEFAULT_WEBSITE) {
  console.log(`Scraping default website: ${process.env.DEFAULT_WEBSITE}`);
  scrapeWebsite(process.env.DEFAULT_WEBSITE).catch(console.error);
}
