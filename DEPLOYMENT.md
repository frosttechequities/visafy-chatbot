# Deployment Guide for Visafy Q&A Chatbot

This guide provides step-by-step instructions for deploying the Visafy Q&A Chatbot to various platforms.

## Option 1: Deploy to Render

### Prerequisites
- A [Render](https://render.com/) account (free tier is sufficient)
- Your code pushed to a GitHub repository

### Steps

1. **Create a Web Service on Render**:
   - Log in to your Render account
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: `visafy-chatbot`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free

2. **Set Environment Variables**:
   - In the "Environment" tab, add the following variables:
     - `GEMINI_API_KEY`: Your Google Gemini API key
     - `SUPABASE_URL`: Your Supabase URL
     - `SUPABASE_API_KEY`: Your Supabase API key
     - `MAX_URLS`: 20 (or your preferred limit)

3. **Deploy the Service**:
   - Click "Create Web Service"
   - Wait for the deployment to complete
   - Your application will be available at `https://visafy-chatbot.onrender.com`

## Option 2: Deploy to Netlify

### Prerequisites
- A [Netlify](https://www.netlify.com/) account (free tier is sufficient)
- Your code pushed to a GitHub repository

### Steps

1. **Create a New Site on Netlify**:
   - Log in to your Netlify account
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure the build settings:
     - Build Command: `npm install`
     - Publish Directory: `public`

2. **Set Environment Variables**:
   - In the "Site settings" > "Environment variables", add the same variables as listed for Render

3. **Configure Netlify Functions**:
   - Create a `netlify.toml` file in your project root:
     ```toml
     [build]
       functions = "functions"
     
     [[redirects]]
       from = "/api/*"
       to = "/.netlify/functions/:splat"
       status = 200
     ```
   - Create a `functions` directory and move your API code there

4. **Deploy the Site**:
   - Commit and push your changes
   - Netlify will automatically deploy your site
   - Your application will be available at your Netlify URL

## Option 3: Deploy to Vercel

### Prerequisites
- A [Vercel](https://vercel.com/) account (free tier is sufficient)
- Your code pushed to a GitHub repository

### Steps

1. **Create a New Project on Vercel**:
   - Log in to your Vercel account
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: `Node.js`
     - Build Command: `npm install`
     - Output Directory: `public`
     - Install Command: `npm install`

2. **Set Environment Variables**:
   - In the "Settings" > "Environment Variables", add the same variables as listed for Render

3. **Deploy the Project**:
   - Click "Deploy"
   - Wait for the deployment to complete
   - Your application will be available at your Vercel URL

## Troubleshooting

### Common Issues

1. **Cold Starts**:
   - Free tier services may have "cold starts" where the first request takes longer
   - This is normal behavior for serverless functions

2. **Memory Limits**:
   - Free tiers often have memory limits
   - If you encounter memory issues, consider reducing MAX_URLS

3. **Rate Limiting**:
   - Gemini API has rate limits
   - If you encounter rate limiting, add delays between requests

4. **Database Connection Issues**:
   - Ensure your Supabase credentials are correct
   - Check that your IP is not blocked by Supabase

5. **Deployment Failures**:
   - Check the build logs for specific errors
   - Ensure all dependencies are correctly specified in package.json
