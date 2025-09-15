# How to Get a Valid SERPAPI Key

## The Problem
Your current SERPAPI key is invalid. You need to get a new one.

## Steps to Get a Valid Key:

1. **Go to**: https://serpapi.com/
2. **Click**: "Sign Up" or "Get Started"
3. **Create an account** (free tier available)
4. **Go to**: https://serpapi.com/manage-api-key
5. **Copy your API key**

## Free Tier Limits:
- 100 searches per month (free)
- Upgrade for more searches if needed

## Add to Render:
1. Go to https://dashboard.render.com/
2. Select your `research-automation` service
3. Go to Environment tab
4. Update `SERPAPI_KEY` with your new valid key
5. Save Changes

## Alternative: Use Mock Data (for testing)
If you don't want to use SERPAPI, we can modify the code to:
- Use mock/dummy data for testing
- Use a different search API
- Implement web scraping directly (slower, less reliable)

## Test Your New Key:
```bash
curl "https://serpapi.com/search.json?engine=google_scholar&q=test&api_key=YOUR_NEW_KEY&num=1"
```

If it returns search results instead of an error, it's working!