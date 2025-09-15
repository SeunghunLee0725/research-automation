# Vercel Frontend Configuration Update

## Backend URL
Your Render backend is deployed at: `https://research-automation.onrender.com`

## Step 1: Update Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update or add the following variable:

```
VITE_API_URL=https://research-automation.onrender.com
```

5. Make sure this is set for all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## Step 2: Redeploy Frontend

After updating the environment variable:

1. Go to the **Deployments** tab
2. Find the latest deployment
3. Click the three dots menu (⋮)
4. Select **Redeploy**
5. Click **Redeploy** in the confirmation dialog

OR trigger a new deployment by pushing any small change:

```bash
git commit --allow-empty -m "Trigger Vercel rebuild with new API URL"
git push origin main
```

## Step 3: Update Render Backend CORS

Now that you have your Vercel URL, update the Render backend:

1. Go to Render dashboard
2. Select your `research-automation` service
3. Go to **Environment** tab
4. Update or add:
   ```
   FRONTEND_URL=https://[your-vercel-app].vercel.app
   ```
5. The service will automatically restart

## Step 4: Test the Production Environment

Once both services are updated:

1. Visit your Vercel frontend URL
2. Test the following:
   - ✅ User registration
   - ✅ User login
   - ✅ Paper search
   - ✅ Save papers
   - ✅ View saved papers
   - ✅ Analysis features

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
- Verify `FRONTEND_URL` in Render includes `https://`
- Ensure no trailing slash in URLs
- Check that both services have restarted after env variable updates

### API Connection Failed
If the frontend can't connect to the backend:
- Check if Render service is running (may take 30-60s to wake up if on free tier)
- Verify `VITE_API_URL` in Vercel is correct
- Check browser network tab for actual request URLs

### Authentication Issues
If login/signup fails:
- Verify Supabase keys are correctly set in both services
- Check Supabase dashboard for any auth errors
- Ensure JWT tokens are being sent in headers

## Important URLs

- **Frontend**: `https://[your-app].vercel.app`
- **Backend API**: `https://research-automation.onrender.com`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/iowswfdxtcuqqawpaeti`

## Next Steps

After successful deployment:
1. Monitor both services for errors
2. Set up error tracking (e.g., Sentry)
3. Configure custom domain (optional)
4. Set up automated backups for Supabase
5. Consider upgrading to paid tiers for better performance