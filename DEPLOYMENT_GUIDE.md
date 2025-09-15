# Deployment Guide for Plasma Research Automation

## Prerequisites
- GitHub account
- Vercel account (for frontend)
- Render account (for backend)
- Supabase project (already set up)

## Step 1: GitHub Repository Setup

### Create a new repository on GitHub:
1. Go to https://github.com/new
2. Repository name: `plasma-research-automation`
3. Make it private or public as needed
4. Don't initialize with README (we already have one)

### Push local code to GitHub:
```bash
# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/plasma-research-automation.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and set environment variables
```

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://iowswfdxtcuqqawpaeti.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. Deploy

## Step 3: Deploy Backend to Render

1. Go to https://render.com/
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - Name: `plasma-research-backend`
   - Environment: Node
   - Branch: main
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add environment variables:
   ```
   SUPABASE_URL=https://iowswfdxtcuqqawpaeti.supabase.co
   SUPABASE_SERVICE_KEY=your_service_key
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-app.vercel.app
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_CX=your_google_cx
   SERP_API_KEY=your_serp_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```
6. Deploy

## Step 4: Update Frontend API URL

After backend deployment:
1. Go to Vercel dashboard
2. Update environment variable:
   ```
   VITE_API_URL=https://plasma-research-backend.onrender.com
   ```
3. Redeploy

## Step 5: Configure CORS

Update `server.js` CORS settings to include your Vercel domain:
```javascript
const corsOptions = {
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:5173'
  ],
  // ... rest of config
}
```

## Production URLs

After deployment, your app will be available at:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://plasma-research-backend.onrender.com`

## Environment Variables Summary

### Frontend (Vercel)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_API_URL`: Your Render backend URL

### Backend (Render)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `NODE_ENV`: production
- `PORT`: 3001
- `FRONTEND_URL`: Your Vercel frontend URL
- API keys for external services

## Testing Production

1. Create a new account on production
2. Test paper search functionality
3. Save papers and verify they're stored
4. Test analysis features
5. Verify user data isolation

## Monitoring

- Vercel: Check deployment logs and analytics
- Render: Monitor service logs and metrics
- Supabase: Check database usage and auth logs

## Troubleshooting

### CORS Issues
- Ensure frontend URL is in backend CORS whitelist
- Check that Authorization headers are being sent

### Authentication Issues
- Verify Supabase keys are correct
- Check JWT token expiration
- Ensure backend is using service role key

### Database Issues
- Check RLS policies in Supabase
- Verify user has proper permissions
- Check Supabase connection limits

## Scaling Considerations

### Free Tier Limits
- Vercel: 100GB bandwidth/month
- Render: Spins down after 15 min inactivity
- Supabase: 500MB database, 2GB bandwidth

### Upgrade Options
- Vercel Pro: $20/month
- Render Paid: $7/month (no spin down)
- Supabase Pro: $25/month