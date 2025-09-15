# 🔧 Fix CORS on Render Backend

## Problem
CORS is blocking requests from `https://research-automation-beta.vercel.app` to the backend.

## Solution - Update Render Environment Variable

### Step 1: Go to Render Dashboard
1. Go to: https://dashboard.render.com/
2. Select your service: `research-automation`

### Step 2: Update Environment Variables
Go to **Environment** tab and add/update:

```
FRONTEND_URL=https://research-automation-beta.vercel.app
```

**IMPORTANT**: Make sure there's NO trailing slash (/)

### Step 3: Service Will Auto-Restart
- The service will automatically restart after saving
- Wait 1-2 minutes for the restart to complete

## Alternative: Update server.js for multiple frontends

If you need to support multiple frontend URLs, update `server.js`:

```javascript
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://research-automation-beta.vercel.app',  // Add this
      'https://research-automation.vercel.app',        // Add this if you have custom domain
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## Verification

After the service restarts:
1. Go to https://research-automation-beta.vercel.app
2. Try searching for papers
3. Check browser console - CORS errors should be gone
4. Search should work properly

## Current Status
- ✅ Backend URL is correct: https://research-automation.onrender.com
- ✅ Frontend is using correct backend URL
- ❌ CORS is blocking the frontend URL
- Need to add: `https://research-automation-beta.vercel.app` to allowed origins

## Quick Test
You can test if CORS is fixed by:
1. Opening browser DevTools (F12)
2. Going to Network tab
3. Searching for papers
4. If CORS is fixed, you'll see successful API responses instead of CORS errors