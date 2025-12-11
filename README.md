<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BizFinder AI

A powerful business intelligence tool that uses Gemini AI and Google Maps Grounding to extract business lists, ratings, and contact info instantly.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`

2. Set the API Key:
   Create a `.env` file in the root directory and add your key:
   ```env
   VITE_API_KEY=AIzaSy...
   ```
   *(Note: `GEMINI_API_KEY` is also supported for backward compatibility)*

3. Run the app:
   `npm run dev`

## ⚠️ Security & Deployment (Important)

### 1. Never commit `.env` to GitHub
This project includes a `.gitignore` file that prevents your `.env` file from being pushed to GitHub.
*   **DO NOT** remove `.env` from `.gitignore`.
*   **DO NOT** upload your `.env` file manually.

### 2. How to Deploy (Vercel/Netlify)
Since `.env` is ignored, your cloud provider won't know your API Key. You must set it manually:

1.  Go to your Project Settings (e.g., on Vercel).
2.  Find **Environment Variables**.
3.  Add a new variable:
    *   Name: `VITE_API_KEY`
    *   Value: `Your_Actual_Google_AI_Key`
4.  Redeploy the application.

### 3. If your Key is Leaked
If you receive a "Leaked API Key" error from Google or the App:
1.  Go to [Google AI Studio](https://aistudio.google.com/) and delete the old key.
2.  Generate a new key.
3.  Update your local `.env` file.
4.  Update the Environment Variables on Vercel/Netlify.
