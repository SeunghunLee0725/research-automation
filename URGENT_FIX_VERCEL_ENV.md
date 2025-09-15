# 🚨 URGENT: Fix Vercel Environment Variable

## Problem
The frontend is trying to connect to `your-backend.onrender.com` instead of the correct backend URL.

## Solution

### Go to Vercel Dashboard NOW and update:

1. **Go to**: https://vercel.com/dashboard
2. **Select your project**: research-automation-beta
3. **Go to**: Settings → Environment Variables
4. **Find**: `VITE_API_URL`
5. **Update to**: 
   ```
   https://research-automation.onrender.com
   ```
   (NOT https://your-backend.onrender.com)

6. **Make sure it's enabled for**:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

7. **Click**: Save

8. **Then go to**: Deployments tab
9. **Click**: ⋮ (three dots) on the latest deployment
10. **Click**: Redeploy
11. **Confirm**: Redeploy

## Verification

After redeployment (2-3 minutes), check:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try searching papers
4. API calls should go to: `https://research-automation.onrender.com/api/...`
   NOT to: `https://your-backend.onrender.com/api/...`

## Current Status
- ❌ Frontend trying to connect to wrong URL
- ✅ Backend is running at: https://research-automation.onrender.com
- ✅ Code is correct and pushed to GitHub
- ❌ Vercel environment variable needs update

## Quick Check
You can verify the current wrong setting by checking the network requests in your browser - they're going to `your-backend.onrender.com` which doesn't exist.