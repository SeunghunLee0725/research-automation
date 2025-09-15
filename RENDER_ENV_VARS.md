# Required Environment Variables for Render Backend

## Add these environment variables in Render Dashboard:

1. **SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://xxxxx.supabase.co`

2. **SUPABASE_SERVICE_KEY**
   - Your Supabase service role key (not the anon key!)
   - Found in Supabase Dashboard → Settings → API

3. **SERPAPI_KEY**
   - Your SerpAPI key for Google Scholar search
   - Get from: https://serpapi.com/manage-api-key

4. **PERPLEXITY_API_KEY**
   - Your Perplexity API key for AI analysis
   - Get from: https://www.perplexity.ai/settings/api

5. **FRONTEND_URL**
   - Your Vercel frontend URL
   - Example: `https://research-automation-beta.vercel.app`

6. **PORT** (Optional)
   - Usually set automatically by Render
   - Default: 3001

## How to Add in Render:

1. Go to https://dashboard.render.com/
2. Select your service: `research-automation`
3. Go to **Environment** tab
4. Add each variable above
5. Click **Save Changes**
6. Service will auto-restart

## Verification:

After adding all variables and restarting:
1. Check Render logs for any missing variable errors
2. Test Google Scholar search from frontend
3. Test paper saving functionality