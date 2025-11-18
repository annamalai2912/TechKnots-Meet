# Fix CORS Error on Render

## The Problem

Your app is trying to make requests to `http://localhost:4000` from `https://techknots-meet.onrender.com`, which causes CORS errors.

## Root Cause

The client was built with `VITE_SERVER_URL=http://localhost:4000` baked into the JavaScript bundle. Vite replaces environment variables at **build time**, so even if you remove the variable later, the old value is still in the built files.

## Solution

### Step 1: Remove VITE_SERVER_URL from Render

1. Go to your Render dashboard
2. Select your service
3. Go to **Environment** tab
4. **DELETE** the `VITE_SERVER_URL` environment variable (or leave it empty)
5. **IMPORTANT**: Make sure `CLIENT_ORIGIN` is set to your Render URL:
   - Example: `https://techknots-meet.onrender.com`
   - No trailing slash
6. Click **Save Changes**

### Step 2: Push Updated Code

The code has been updated to:
- Use relative URLs in production (no need for VITE_SERVER_URL)
- Handle CORS properly for same-origin requests

```bash
cd "C:\Users\Annu\Downloads\projects\conf\meet\New folder"
git add .
git commit -m "Fix CORS and use relative URLs in production"
git push
```

### Step 3: Force Rebuild on Render

1. In Render dashboard, go to your service
2. Click **Manual Deploy** → **Clear build cache & deploy**
3. This will rebuild the client without `VITE_SERVER_URL`, so it will use relative URLs

### Step 4: Verify Environment Variables

Make sure these are set in Render:

```
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://techknots-meet.onrender.com  ← Your actual Render URL
GOOGLE_CLIENT_ID=your-google-client-id
JWT_SECRET=your-secret
MEDIASOUP_LISTEN_IP=0.0.0.0
MEDIASOUP_ANNOUNCED_IP=auto
MEDIASOUP_MIN_PORT=40000
MEDIASOUP_MAX_PORT=49999
```

**DO NOT SET** `VITE_SERVER_URL` - leave it unset or empty.

### Step 5: Test

1. Wait for deployment to complete
2. Visit your Render URL
3. Open browser console (F12)
4. Try signing in
5. Check that requests go to relative URLs (e.g., `/api/auth/google`) instead of `http://localhost:4000/api/auth/google`

## Why This Works

- **In production**: Client and server are on the same domain (your Render URL)
- **Relative URLs**: `/api/auth/google` automatically uses the same domain
- **No CORS needed**: Same-origin requests don't need CORS
- **Updated CORS config**: Server now allows same-origin requests in production

## If It Still Doesn't Work

1. **Check browser console** - Look for the actual request URL
2. **Check Network tab** - See where requests are going
3. **Verify build** - Make sure the rebuild completed successfully
4. **Clear browser cache** - Old JavaScript might be cached

## Quick Checklist

- [ ] Removed `VITE_SERVER_URL` from Render environment variables
- [ ] Set `CLIENT_ORIGIN` to your Render URL
- [ ] Pushed updated code to GitHub
- [ ] Triggered "Clear build cache & deploy" on Render
- [ ] Waited for deployment to complete
- [ ] Tested sign-in
- [ ] Verified requests use relative URLs (check Network tab)

