# Render Backend Deployment Guide

## Step 1: Create Render Account
1. Go to https://render.com and sign up/login
2. Connect your GitHub account

## Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect to GitHub repository: `SeunghunLee0725/research-automation`
3. Configure the service:
   - **Name**: `plasma-research-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (or paid for better performance)

## Step 3: Add Environment Variables
In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://iowswfdxtcuqqawpaeti.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvd3N3ZmR4dGN1cXFhd3BhZXRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg5NzQwNywiZXhwIjoyMDczNDczNDA3fQ.7FaBdfh0M7D8rY7yMdiOsZ8XGQNo6cNDdff5hjzpdp8
FRONTEND_URL=[Your Vercel URL - will be updated later]
GOOGLE_API_KEY=[Your Google API Key]
GOOGLE_CX=[Your Google Custom Search Engine ID]
SERP_API_KEY=[Your SERP API Key]
OPENAI_API_KEY=[Your OpenAI API Key]
```

## Step 4: Deploy
1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Note your service URL (e.g., `https://plasma-research-backend.onrender.com`)

## Step 5: Update Vercel Frontend
1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Update `VITE_API_URL` to your Render backend URL:
   ```
   VITE_API_URL=https://plasma-research-backend.onrender.com
   ```
4. Redeploy the frontend

## Step 6: Update CORS in Backend
1. After getting your Vercel URL, update the Render environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
2. This will automatically configure CORS to accept requests from your frontend

## Important Notes

### Free Tier Limitations
- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid tier ($7/month) for always-on service

### Security
- Keep your SERVICE_KEY secure - it has admin access to your database
- Ensure CORS is properly configured to only accept requests from your frontend
- Regularly rotate API keys

### Monitoring
- Check Render logs for any errors
- Monitor service metrics in the dashboard
- Set up alerts for service failures

## Troubleshooting

### Service Won't Start
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `server.js` exists in repository root

### CORS Errors
- Verify FRONTEND_URL is correctly set in Render
- Check that the URL includes the protocol (https://)
- Ensure no trailing slash in URLs

### Database Connection Issues
- Verify Supabase credentials are correct
- Check if Supabase project is active
- Review connection limits in Supabase dashboard

## Next Steps
After successful deployment:
1. Test all API endpoints
2. Verify authentication flow
3. Check data persistence
4. Monitor performance
5. Set up error tracking (optional)