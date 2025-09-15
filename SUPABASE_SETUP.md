# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or login
3. Click "New Project"
4. Fill in:
   - Project name: `plasma-research-automation`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Get API Keys

After project creation:
1. Go to Settings → API
2. Copy:
   - `Project URL` → Save as `VITE_SUPABASE_URL`
   - `anon public` key → Save as `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → Save as `SUPABASE_SERVICE_KEY` (for backend)

## 3. Configure Database

1. Go to SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to create all tables and policies

## 4. Configure Authentication

1. Go to Authentication → Settings
2. Enable Email Auth
3. Configure:
   - Enable email confirmations: OFF (for development)
   - Minimum password length: 8
4. Optional: Enable OAuth providers (Google, GitHub)

## 5. Update Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_KEY=[YOUR_SERVICE_KEY]
```

## 6. Test Connection

Run this in browser console after setup:
```javascript
import { supabase } from './src/lib/supabase';
const { data, error } = await supabase.from('profiles').select('*');
console.log(data, error);
```

## 7. Production Deployment

### For Vercel:
Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (Render backend URL)

### For Render:
Add environment variables in Render dashboard:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- All other API keys

## Security Notes

1. **Never commit** `.env` files to Git
2. **Service keys** should only be used on backend
3. **RLS policies** are enforced - users can only access their own data
4. **Enable 2FA** on your Supabase account for production