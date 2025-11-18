# Render.com Troubleshooting Guide

## Issue: Sign In Doesn't Navigate to Dashboard

### Common Causes & Solutions

### 1. **Environment Variables Not Set Correctly**

**Problem**: `VITE_SERVER_URL` is set incorrectly or missing.

**Solution**: 
- In Render dashboard, go to your service → **Environment** tab
- **Remove** `VITE_SERVER_URL` environment variable (or leave it empty)
- In production, the app uses relative URLs automatically
- Only set `VITE_SERVER_URL` if you need to point to a different server

**OR** if you want to keep it explicit:
- Set `VITE_SERVER_URL` to your Render URL: `https://your-app-name.onrender.com`

### 2. **CORS Issues**

**Problem**: Server is rejecting requests due to CORS.

**Solution**:
- Check `CLIENT_ORIGIN` environment variable in Render
- It should match your Render URL exactly: `https://your-app-name.onrender.com`
- Make sure there's no trailing slash
- After updating, redeploy the service

### 3. **Google OAuth Configuration**

**Problem**: Google OAuth redirect URI doesn't match.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, ensure you have:
   - `https://your-app-name.onrender.com` (your exact Render URL)
5. Under **Authorized redirect URIs**, ensure you have:
   - `https://your-app-name.onrender.com`
6. Click **Save**
7. Wait 5-10 minutes for changes to propagate

### 4. **API Endpoint Not Working**

**Problem**: The `/api/auth/google` endpoint is failing.

**Check**:
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Try signing in
4. Check for error messages
5. Go to **Network** tab
6. Look for the `/api/auth/google` request
7. Check if it's returning an error (status 401, 500, etc.)

**Common Errors**:
- **401 Unauthorized**: Google Client ID mismatch
- **500 Internal Server Error**: Check Render logs
- **CORS error**: Check `CLIENT_ORIGIN` setting

### 5. **Check Render Logs**

1. In Render dashboard, go to your service
2. Click **Logs** tab
3. Look for errors when you try to sign in
4. Common errors:
   - `Google authentication failed` - Check Google Client ID
   - `Missing auth token` - Check OAuth flow
   - `Invalid token` - JWT secret mismatch

### 6. **Browser Console Errors**

Open browser console (F12) and check for:
- Network errors (red requests)
- JavaScript errors
- CORS errors
- Authentication errors

### 7. **Clear Browser Cache**

Sometimes cached files cause issues:
1. Clear browser cache
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Try in incognito/private mode

### 8. **Verify Environment Variables**

Make sure all these are set in Render:

```
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://your-app-name.onrender.com
GOOGLE_CLIENT_ID=your-google-client-id-here
JWT_SECRET=your-random-secret-here
MEDIASOUP_LISTEN_IP=0.0.0.0
MEDIASOUP_ANNOUNCED_IP=auto
MEDIASOUP_MIN_PORT=40000
MEDIASOUP_MAX_PORT=49999
```

**Important**: 
- `CLIENT_ORIGIN` must match your Render URL exactly
- `GOOGLE_CLIENT_ID` must match your Google Cloud Console Client ID
- `JWT_SECRET` should be a long random string

### 9. **Test API Endpoint Directly**

Test if the API is working:
1. Visit: `https://your-app-name.onrender.com/health`
2. Should return: `{"status":"ok","service":"techknots-meet-server"}`

If this doesn't work, the server isn't running properly.

### 10. **Rebuild and Redeploy**

Sometimes a fresh build fixes issues:
1. In Render dashboard, go to your service
2. Click **Manual Deploy** → **Clear build cache & deploy**
3. Wait for deployment to complete
4. Try again

---

## Quick Debugging Steps

1. ✅ Check browser console for errors
2. ✅ Check Render logs for server errors
3. ✅ Verify `CLIENT_ORIGIN` matches your Render URL
4. ✅ Verify Google OAuth settings include your Render URL
5. ✅ Test `/health` endpoint
6. ✅ Clear browser cache and try again
7. ✅ Check all environment variables are set
8. ✅ Try in incognito mode

---

## Still Not Working?

If none of the above works:

1. **Check the exact error message** in browser console
2. **Check Render logs** for server-side errors
3. **Verify**:
   - Google Client ID is correct
   - Render URL is correct
   - All environment variables are set
   - Google OAuth settings are updated

4. **Test locally first** to ensure the code works:
   ```bash
   cd server
   npm run dev
   # In another terminal
   cd client
   npm run dev
   ```

If it works locally but not on Render, it's an environment/configuration issue.

---

## Updated Code

The code has been updated to:
- ✅ Use relative URLs in production (no need for `VITE_SERVER_URL`)
- ✅ Add better error handling with detailed error messages
- ✅ Log errors to console for debugging

After deploying the updated code, check the browser console for specific error messages.

