# URGENT: Fix CORS Error - Step by Step

## The Problem
Your app is still trying to access `http://localhost:4000` because the old build is cached. The runtime fix I added will work, but you need to deploy it first.

## CRITICAL: Do These Steps in Order

### Step 1: Update Render Environment Variables (DO THIS FIRST!)

1. **Go to Render Dashboard** → Your service → **Environment** tab
2. **Find `CLIENT_ORIGIN`** and set it to:
   ```
   https://techknots-meet.onrender.com
   ```
   (Replace with your ACTUAL Render URL - check your service URL)
3. **Find `VITE_SERVER_URL`** - DELETE it or leave it EMPTY
4. **Click "Save Changes"** at the bottom
5. **Wait for the service to restart** (takes ~30 seconds)

### Step 2: Push Updated Code

```powershell
cd "C:\Users\Annu\Downloads\projects\conf\meet\New folder"
git add .
git commit -m "Fix localhost URL detection in production"
git push
```

### Step 3: Force Rebuild on Render

1. **Go to Render Dashboard** → Your service
2. Click **"Manual Deploy"** button (top right)
3. Select **"Clear build cache & deploy"**
4. Click **"Deploy latest commit"**
5. **Wait 5-10 minutes** for build to complete

### Step 4: Clear Browser Cache

1. Open your Render URL in browser
2. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
3. Select "Cached images and files"
4. Click "Clear data"
5. **OR** use Incognito/Private mode

### Step 5: Test

1. Visit your Render URL
2. Open browser console (F12)
3. You should see: `⚠️ Detected localhost URL in production build, switching to relative URLs`
4. Try signing in

## What the Fix Does

The updated code now:
- ✅ **Detects at runtime** if you're on a remote domain (not localhost)
- ✅ **Automatically switches** from localhost URLs to relative URLs
- ✅ **Works even with old builds** that have localhost baked in
- ✅ **Shows clear warnings** in console so you know it's working

## Verify It's Working

After deployment, check browser console:
- ✅ Should see: `⚠️ Detected localhost URL in production build, switching to relative URLs`
- ✅ Should see: `Original baseURL: http://localhost:4000 → Using relative URLs`
- ✅ Network tab should show requests to `/api/auth/google` (not `http://localhost:4000/api/auth/google`)

## If Still Not Working

### Check 1: Is the new code deployed?
- Check Render logs - should show the new build
- Check browser console - should see the warning messages
- Hard refresh: `Ctrl+Shift+R`

### Check 2: Is CLIENT_ORIGIN set correctly?
- Must be your exact Render URL
- Must start with `https://`
- No trailing slash
- Example: `https://techknots-meet.onrender.com`

### Check 3: Check Render Logs
- Go to Render dashboard → Logs
- Look for any errors
- Should see: `TechKnots Meet server running on port 4000`

### Check 4: Browser Console
- Open F12 → Console tab
- Look for the warning messages
- If you don't see them, the new code isn't loaded yet

## Quick Test

After deployment, open browser console and type:
```javascript
console.log('Current origin:', window.location.origin)
```

Should show your Render URL, not localhost.

## Still Having Issues?

1. **Screenshot the browser console** (F12 → Console tab)
2. **Screenshot Render logs** (Dashboard → Logs tab)
3. **Check environment variables** are saved correctly
4. **Verify the build completed** successfully

The runtime fix will work once the new code is deployed. Make sure you:
1. ✅ Updated CLIENT_ORIGIN in Render
2. ✅ Pushed the new code
3. ✅ Cleared build cache and redeployed
4. ✅ Cleared browser cache

