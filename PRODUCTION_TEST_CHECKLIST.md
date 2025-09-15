# Production Environment Test Checklist

## 🚀 Production URLs
- **Frontend (Vercel)**: https://research-automation-beta.vercel.app
- **Backend API (Render)**: https://research-automation.onrender.com
- **Database (Supabase)**: https://iowswfdxtcuqqawpaeti.supabase.co

## 📝 Environment Variables Status

### Vercel (Frontend)
✅ Required:
- `VITE_API_URL=https://research-automation.onrender.com`
- `VITE_SUPABASE_URL=https://iowswfdxtcuqqawpaeti.supabase.co`
- `VITE_SUPABASE_ANON_KEY=[Already set in .env]`

### Render (Backend)
✅ Required:
- `NODE_ENV=production`
- `PORT=3001`
- `SUPABASE_URL=https://iowswfdxtcuqqawpaeti.supabase.co`
- `SUPABASE_SERVICE_KEY=[Already set in .env]`
- `FRONTEND_URL=https://research-automation-beta.vercel.app`

⚠️ Optional (for full functionality):
- `GOOGLE_API_KEY=[Your key]`
- `GOOGLE_CX=[Your custom search engine ID]`
- `SERP_API_KEY=[Your key]`
- `OPENAI_API_KEY=[Your key]`

## ✅ Testing Checklist

### 1. Authentication Flow
- [ ] Access https://research-automation-beta.vercel.app
- [ ] Sign up with new email
- [ ] Verify email (check inbox)
- [ ] Log in with credentials
- [ ] Log out
- [ ] Log in again

### 2. Paper Collection
- [ ] Navigate to Paper Collection
- [ ] Search for papers (test query: "atmospheric plasma")
- [ ] View search results
- [ ] Click on paper details
- [ ] Save selected papers

### 3. Saved Papers
- [ ] Navigate to Saved Papers
- [ ] Verify saved papers appear
- [ ] View paper details
- [ ] Delete a paper
- [ ] Verify deletion

### 4. Analysis Features
- [ ] Go to Text Analysis
- [ ] Select saved papers
- [ ] Run analysis
- [ ] View results

### 5. Trend Analysis
- [ ] Navigate to Trends
- [ ] Load trend data
- [ ] View visualizations

### 6. Report Generation
- [ ] Go to Reports
- [ ] Generate a report
- [ ] View/download report

### 7. Settings
- [ ] Navigate to Settings
- [ ] Update API keys (if available)
- [ ] Save settings
- [ ] Verify persistence

### 8. Performance Check
- [ ] Initial page load time (should be < 3s)
- [ ] API response times (should be < 2s)
- [ ] Search functionality speed
- [ ] No console errors

## 🔍 Common Issues & Solutions

### CORS Errors
**Error**: "Access to fetch at ... from origin ... has been blocked by CORS"
**Solution**: 
1. Verify `FRONTEND_URL` in Render is exactly: `https://research-automation-beta.vercel.app`
2. Restart Render service
3. Clear browser cache

### API Connection Failed
**Error**: "Failed to fetch" or "Network error"
**Solution**:
1. Check if Render service is awake (may take 30-60s on free tier)
2. Verify `VITE_API_URL` in Vercel is: `https://research-automation.onrender.com`
3. Check Render logs for errors

### Authentication Issues
**Error**: "Invalid credentials" or "User not found"
**Solution**:
1. Check Supabase dashboard for user status
2. Verify email confirmation
3. Check JWT token expiration

### Slow Initial Load
**Issue**: First request takes 30-60 seconds
**Solution**: This is normal for Render free tier (cold start). Consider upgrading to paid tier.

## 📊 Monitoring

### Vercel Dashboard
- Check build logs
- Monitor function logs
- Review analytics

### Render Dashboard
- Check service logs
- Monitor metrics
- Review deployment status

### Supabase Dashboard
- Check authentication logs
- Monitor database usage
- Review API usage

## ✅ Deployment Success Criteria

All items must be checked for successful deployment:
- [ ] User can sign up and log in
- [ ] Papers can be searched and saved
- [ ] Saved papers persist across sessions
- [ ] Analysis features work
- [ ] No critical errors in console
- [ ] Response times are acceptable
- [ ] CORS is properly configured

## 📱 Mobile Responsiveness
- [ ] Test on mobile device
- [ ] Check navigation menu
- [ ] Verify forms are usable
- [ ] Check data tables display

## 🎉 Final Steps

Once all tests pass:
1. Document any issues found
2. Create GitHub issues for bugs
3. Plan performance optimizations
4. Consider setting up monitoring tools
5. Prepare user documentation

---

## Notes
- Render free tier will sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Vercel free tier has 100GB bandwidth limit
- Supabase free tier has 500MB database limit

## Support
- Vercel Support: https://vercel.com/support
- Render Support: https://render.com/docs
- Supabase Support: https://supabase.com/docs