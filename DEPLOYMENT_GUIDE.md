# CampusConnect - Deployment Guide

This guide provides step-by-step instructions to deploy CampusConnect to **Vercel** (Frontend) and **Render** (Backend).

---

## 🚀 1. Deploying Backend to Render.com

1. **Create Render Web Service**:
   - Push repository to GitHub/GitLab.
   - Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
   - Select the repository branch and set **Root Directory** to `backend`.

2. **Configure Environment & Commands**:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Add Environment Variables**:
   Set the following variables in Render Environment settings:
   - `PORT`: `5000`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/campusconnect`
   - `JWT_SECRET`: `your_production_secret`
   - `GEMINI_API_KEY`: `your_google_gemini_key`

---

## ⚡ 2. Deploying Frontend to Vercel

1. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/) -> **Add New Project**.
   - Import your CampusConnect repository.
   - Set **Root Directory** to `frontend`.

2. **Build Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Set Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-render-backend-url.onrender.com/api`
   - `VITE_GEMINI_API_KEY`: `your_gemini_key`

4. **Deploy**:
   - Click **Deploy**. Vercel will build and assign an SSL production URL (e.g. `https://campusconnect.vercel.app`).

---

## 🛠️ Local Verification & Health Check

- Test Backend Health: `GET https://your-backend.onrender.com/api/health`
- Verify MongoDB Connection in Render Logs.
