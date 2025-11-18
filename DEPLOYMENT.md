# Deployment Guide: TechKnots Meet on Render.com

This guide will walk you through deploying TechKnots Meet to Render.com step by step.

## Prerequisites

1. **GitHub Account** - You need a GitHub account to connect your repository
2. **Render.com Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **Google OAuth Credentials** - You'll need your Google Client ID

---

## Step 1: Push Your Code to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
cd "C:\Users\Annu\Downloads\projects\conf\meet\New folder"
git init
git add .
git commit -m "Initial commit: TechKnots Meet"
```

### 1.2 Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it: `techknots-meet` (or any name you prefer)
4. **DO NOT** check "Initialize with README" (you already have files)
5. Click **Create repository**

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/techknots-meet.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Prepare Google OAuth

### 2.1 Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Copy the **Client ID** (you'll need this later)

### 2.2 Note Your OAuth Settings

You'll need to update these after deployment, but for now, make sure you have:
- Your Google Client ID ready

---

## Step 3: Deploy to Render.com

### 3.1 Sign Up / Sign In to Render

1. Go to [render.com](https://render.com)
2. Click **Get Started for Free** or **Sign In**
3. Sign up with your GitHub account (recommended for easy integration)

### 3.2 Create New Web Service

1. In your Render dashboard, click **New +** → **Web Service**
2. Click **Connect account** if you haven't connected GitHub yet
3. Select your GitHub account
4. Find and select your `techknots-meet` repository
5. Click **Connect**

### 3.3 Configure the Service

Fill in the following settings:

#### Basic Settings:
- **Name**: `techknots-meet` (or any name you prefer)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main` (or `master` if that's your default branch)
- **Root Directory**: `server` ⚠️ **IMPORTANT: Set this to `server`**
- **Runtime**: `Node`
- **Build Command**: `cd ../client && npm install && npm run build && cd ../server && npm install`
- **Start Command**: `npm start`

#### Environment Variables:

Click **Advanced** → **Add Environment Variable** and add these one by one:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `4000` | Render will override this, but set it anyway |
| `CLIENT_ORIGIN` | `https://your-app-name.onrender.com` | ⚠️ Replace with your actual Render URL (you'll get this after first deploy) |
| `GOOGLE_CLIENT_ID` | `your-google-client-id` | Your actual Google OAuth Client ID |
| `JWT_SECRET` | `generate-a-random-secret-here` | Use a long random string (e.g., use a password generator) |
| `MEDIASOUP_LISTEN_IP` | `0.0.0.0` | Required |
| `MEDIASOUP_ANNOUNCED_IP` | `auto` | Render will handle this |
| `MEDIASOUP_MIN_PORT` | `40000` | Required |
| `MEDIASOUP_MAX_PORT` | `49999` | Required |

**Important Notes:**
- For `CLIENT_ORIGIN`: Initially, you can use a placeholder like `https://techknots-meet.onrender.com`. After the first deployment, Render will give you the actual URL, and you'll need to update this.
- For `JWT_SECRET`: Generate a secure random string. You can use: `openssl rand -base64 32` or any password generator.

### 3.4 Create the Service

1. Scroll down and click **Create Web Service**
2. Render will start building and deploying your app
3. This will take 5-10 minutes on the first deploy

---

## Step 4: Update Configuration After First Deploy

### 4.1 Get Your Render URL

1. Once deployment starts, you'll see a URL like: `https://techknots-meet-xxxx.onrender.com`
2. Copy this URL

### 4.2 Update CLIENT_ORIGIN

1. In Render dashboard, go to your service
2. Click **Environment** tab
3. Find `CLIENT_ORIGIN` and update it to your actual Render URL
4. Click **Save Changes**
5. Render will automatically redeploy

### 4.3 Update Google OAuth Settings

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, click **+ ADD URI**:
   - Add: `https://your-app-name.onrender.com` (your actual Render URL)
5. Under **Authorized redirect URIs**, click **+ ADD URI**:
   - Add: `https://your-app-name.onrender.com`
6. Click **Save**

---

## Step 5: Verify Deployment

### 5.1 Check Build Logs

1. In Render dashboard, click on your service
2. Go to **Logs** tab
3. Check for any errors
4. Look for: `TechKnots Meet server running on port 4000`

### 5.2 Test Your App

1. Visit your Render URL: `https://your-app-name.onrender.com`
2. You should see the landing page
3. Try signing in with Google
4. Create a test room
5. Test video/audio (you may need to allow camera/microphone permissions)

---

## Step 6: Custom Domain (Optional)

If you want to use a custom domain:

1. In Render dashboard, go to your service
2. Click **Settings** tab
3. Scroll to **Custom Domains**
4. Click **Add Custom Domain**
5. Follow Render's instructions to configure DNS

Then update:
- `CLIENT_ORIGIN` environment variable to your custom domain
- Google OAuth settings to include your custom domain

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Check that `rootDir` is set to `server`
- Verify build command includes `npm install` for both client and server

**Error: "Build timeout"**
- Free tier has build time limits
- Try optimizing: remove unnecessary dependencies
- Consider upgrading to paid plan

### App Doesn't Load

**Blank page or 404**
- Check that `CLIENT_ORIGIN` matches your Render URL exactly
- Verify static files are being served (check server logs)
- Ensure build completed successfully

### OAuth Not Working

**"Redirect URI mismatch"**
- Verify Google OAuth settings include your Render URL
- Check `CLIENT_ORIGIN` environment variable matches exactly
- Clear browser cache and try again

### Video/Audio Not Working

**WebRTC connection issues**
- Mediasoup requires UDP ports - Render may have limitations
- Check browser console for WebRTC errors
- Try different browsers (Chrome/Edge work best)
- Note: Free tier on Render may have limitations for WebRTC

### Service Keeps Sleeping (Free Tier)

Render free tier services sleep after 15 minutes of inactivity:
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to paid plan for always-on service
- Or use a service like [UptimeRobot](https://uptimerobot.com) to ping your app every 5 minutes

---

## Important Notes

### Render Free Tier Limitations

- **Sleeping**: Services sleep after 15 min inactivity
- **Build Time**: Limited build time (may need optimization)
- **Bandwidth**: Limited bandwidth
- **WebRTC**: May have limitations for UDP/WebRTC traffic

### For Production Use

Consider upgrading to Render's paid plan ($7/month) for:
- Always-on service (no sleeping)
- Better performance
- More resources
- Better WebRTC support

### Alternative: Railway.app

If Render doesn't work well for WebRTC, consider [Railway.app](https://railway.app):
- Better WebRTC support
- More generous free tier
- Easier configuration

---

## Next Steps

1. ✅ Test with multiple users from different locations
2. ✅ Monitor logs for any errors
3. ✅ Set up monitoring/alerting
4. ✅ Consider upgrading to paid plan for production
5. ✅ Set up custom domain (optional)

---

## Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Ensure Google OAuth is configured properly

---

**Congratulations! Your TechKnots Meet app is now live on the internet! 🎉**

Share your Render URL with users anywhere in the world to test your video conferencing app.

