# Immediate Fix for CORS Error

## Quick Fix (Works Even Without Rebuild)

I've added **runtime detection** that will automatically fix the localhost URL issue even with the old build. However, you still need to:

### Step 1: Update Render Environment Variables (CRITICAL)

1. Go to Render dashboard → Your service → **Environment** tab
2. **Set `CLIENT_ORIGIN`** to your Render URL:
   ```
   CLIENT_ORIGIN=https://techknots-meet.onrender.com
   ```
   (Replace with your actual Render URL - no trailing slash)
3. **Remove or leave empty `VITE_SERVER_URL`**
4. Click **Save Changes**

### Step 2: Push Updated Code

```bash
cd "C:\Users\Annu\Downloads\projects\conf\meet\New folder"
git add .
git commit -m "Add runtime localhost detection and fix CORS"
git push
```

### Step 3: Redeploy

1. In Render dashboard → Your service
2. Click **Manual Deploy** → **Clear build cache & deploy**
3. Wait for deployment

### Step 4: Test

1. Visit your Render URL
2. Open browser console (F12)
3. You should see a warning: "Detected localhost URL in production, using relative URLs instead"
4. Try signing in - it should work now!

## What the Fix Does

The updated code now:
1. **Runtime Detection**: Automatically detects if localhost URLs are being used in production and switches to relative URLs
2. **Better CORS**: Server now allows Render.com domains and same-origin requests
3. **Error Logging**: Shows helpful warnings in console

## If You Still See Errors

### Check 1: Verify CLIENT_ORIGIN
- Must match your Render URL exactly
- No trailing slash
- Must be `https://` not `http://`

### Check 2: Check Browser Console
- Look for the warning message about localhost detection
- Check Network tab - requests should go to `/api/auth/google` not `http://localhost:4000/api/auth/google`

### Check 3: Check Render Logs
- Go to Render dashboard → Logs
- Look for CORS warnings
- Should show allowed origins

### Check 4: Hard Refresh
- Clear browser cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or try incognito mode

## The Cross-Origin-Opener-Policy Warning

The `Cross-Origin-Opener-Policy` warning is from Google OAuth and is usually harmless. It's a browser security feature. If sign-in works, you can ignore it.

## Still Not Working?

1. **Check the exact error** in browser console
2. **Check Network tab** - what URL is being called?
3. **Check Render logs** - any CORS errors?
4. **Verify environment variables** are saved correctly

The runtime fix should work immediately after deployment, even if the build had localhost URLs baked in.

