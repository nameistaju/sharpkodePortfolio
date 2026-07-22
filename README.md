# SharpKode Tech Solutions

This repository contains the complete frontend and backend for SharpKode Tech Solutions.

## Architecture
- **Frontend:** Static HTML, Vanilla CSS, JS (Hosted on Vercel)
- **Backend:** Node.js Express API with NVIDIA Build (NVIDIA NIM) RAG Chatbot (Hosted on Render)
- **Domain:** Configured via Hostinger DNS

## Deployment Guide

### 1. Backend (Render)
1. Go to [Render](https://render.com) and create a new **Web Service**.
2. Connect this repository and set the Root Directory to `server`.
3. Render will automatically detect the `render.yaml` configuration.
4. Go to the service **Environment** settings and add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key (used for embedding generation)
   - `NVIDIA_API_KEY`: Your NVIDIA Build API Key
   - `NVIDIA_MODEL`: `meta/llama-3.3-70b-instruct`
5. Deploy the service.
6. Note the provided `.onrender.com` URL.

### 2. DNS Configuration (Hostinger)
To connect `api.sharpkode.com` to the Render backend:
1. Log in to your Hostinger DNS Zone.
2. Add a `CNAME` record:
   - **Name:** `api`
   - **Target:** `your-app-name.onrender.com` (from Step 1)
   - **TTL:** Default
3. Go back to Render > Settings > Custom Domains and add `api.sharpkode.com`.

### 3. Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and import this repository.
2. Leave the Root Directory as `/` (default).
3. The `vercel.json` file is already configured for production caching and security headers.
4. Deploy the project.
5. In Vercel > Settings > Domains, assign `sharpkode.com` and `www.sharpkode.com`.
6. Ensure your Hostinger DNS points to Vercel's IP/nameservers for the root domain.

## Local Development

**Run Backend:**
\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

**Run Frontend:**
Open `index.html` in your browser or use a live server (e.g. VS Code Live Server). The frontend is automatically configured to use the local API if you are on `localhost`.
