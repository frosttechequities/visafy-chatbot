# Visafy Q&A Chatbot

A chatbot that can answer questions about immigration programs and requirements using Retrieval Augmented Generation (RAG).

## Overview

This application allows users to:
- Train the chatbot on any website by providing the URL
- Ask questions about the website content
- Get AI-generated answers based on the content

It's particularly useful for answering questions about immigration programs, requirements, and processes.

## Features

- **Website Scraping**: Automatically extracts content from websites using their sitemap.xml
- **Vector Embeddings**: Converts website content to vector embeddings for efficient retrieval
- **Similarity Search**: Finds the most relevant content to answer user questions
- **AI-Powered Answers**: Uses Google's Gemini API to generate natural language answers

## Technologies Used

- **Backend**: Node.js with Express
- **Vector Database**: Supabase with pgvector extension
- **Embeddings**: Google Gemini API
- **Web Scraping**: CheerioWebBaseLoader
- **Frontend**: HTML, CSS, JavaScript

## Setup

1. **Environment Variables**:
   - Create a `.env` file with the following variables:
     ```
     # API Keys
     GEMINI_API_KEY=your_gemini_api_key

     # Supabase Configuration
     SUPABASE_URL=your_supabase_url
     SUPABASE_API_KEY=your_supabase_api_key

     # Application Settings
     PORT=3000
     DEFAULT_WEBSITE=https://visafy.com
     MAX_URLS=20
     ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Start the Application**:
   ```
   npm start
   ```

4. **Access the Application**:
   - Open your browser and go to `http://localhost:3000`

## Usage

1. **Train the Chatbot**:
   - Enter a website URL in the input field (e.g., https://visafy.com)
   - Click "Train"
   - Wait for the training to complete

2. **Ask Questions**:
   - Type your question in the input field
   - Click "Ask" or press Enter
   - View the AI-generated answer

## Limitations

- The free tier of Gemini API limits the number of tokens per month
- The application processes a maximum of 20 URLs from a website (configurable via MAX_URLS)
- Websites without a sitemap.xml file may not work properly

## Deployment

This application can be deployed to various platforms:

- **Render**: Free tier with auto-sleep after inactivity
- **Netlify**: Free tier with serverless functions
- **Vercel**: Free tier with serverless functions

## License

This project is licensed under the MIT License.
