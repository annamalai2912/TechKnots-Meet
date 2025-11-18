# Render.com Quick Start Guide

## 🚀 Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push
```

### 2. Deploy on Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `techknots-meet`
   - **Root Directory**: `server` ⚠️
   - **Build Command**: `cd ../client && npm install && npm run build && cd ../server && npm install`
   - **Start Command**: `npm start`

### 3. Add Environment Variables

Add these in Render dashboard → Environment tab:

```
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://your-app-name.onrender.com
GOOGLE_CLIENT_ID=your-google-client-id
JWT_SECRET=your-random-secret-here
MEDIASOUP_LISTEN_IP=0.0.0.0
MEDIASOUP_ANNOUNCED_IP=auto
MEDIASOUP_MIN_PORT=40000
MEDIASOUP_MAX_PORT=49999
```

### 4. After First Deploy

1. Copy your Render URL (e.g., `https://techknots-meet-xxxx.onrender.com`)
2. Update `CLIENT_ORIGIN` to match your URL
3. Update Google OAuth settings with your Render URL

### 5. Test

Visit your Render URL and test the app!

---

📖 **Full detailed guide**: See `DEPLOYMENT.md`

