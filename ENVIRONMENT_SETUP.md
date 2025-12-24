# Environment Configuration Guide

## Overview
This guide explains how to configure environment variables for different deployment environments (development, staging, production).

## Environment Variables

### Required Variables

#### 1. **REACT_APP_API_URL**
- **Description**: Backend API base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.yesrasew.com`
- **Usage**: Used by all API services

#### 2. **REACT_APP_SUPABASE_URL**
- **Description**: Supabase project URL
- **Format**: `https://[project-id].supabase.co`
- **Required**: Yes
- **Usage**: Database and authentication

#### 3. **REACT_APP_SUPABASE_ANON_KEY**
- **Description**: Supabase anonymous/public key
- **Required**: Yes
- **Usage**: Client-side database access

### Optional Variables

#### 4. **REACT_APP_LISTINGS_API**
- **Description**: Specific listings API endpoint (if different from main API)
- **Default**: Falls back to `REACT_APP_API_URL`
- **Usage**: Listings service

## Setup Instructions

### For Development

1. Create a `.env.local` file in the project root:
```bash
# Development Environment Variables
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Start the development server:
```bash
npm start
```

### For Production

1. Set environment variables in your hosting platform:

#### Vercel
```bash
vercel env add REACT_APP_API_URL
# Enter: https://api.yesrasew.com

vercel env add REACT_APP_SUPABASE_URL
# Enter: https://your-project.supabase.co

vercel env add REACT_APP_SUPABASE_ANON_KEY
# Enter: your-production-anon-key
```

#### Netlify
```bash
# In Netlify Dashboard > Site Settings > Environment Variables
REACT_APP_API_URL=https://api.yesrasew.com
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-production-anon-key
```

#### AWS Amplify
```bash
# In AWS Amplify Console > App Settings > Environment Variables
REACT_APP_API_URL=https://api.yesrasew.com
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-production-anon-key
```

### For Staging

1. Create a `.env.staging` file:
```bash
# Staging Environment Variables
REACT_APP_API_URL=https://staging-api.yesrasew.com
REACT_APP_SUPABASE_URL=https://staging-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-staging-anon-key
```

2. Build for staging:
```bash
npm run build:staging
```

## Default Fallback Values

If environment variables are not set, the application uses these production defaults:

| Variable | Default Value |
|----------|--------------|
| `REACT_APP_API_URL` | `https://api.yesrasew.com` |
| `REACT_APP_LISTINGS_API` | Falls back to `REACT_APP_API_URL` |

**Note**: Supabase variables have no defaults and must be set.

## Files Updated

The following files have been updated to use production-ready defaults:

1. **src/services/api.js**
   - Main API service
   - Default: `https://api.yesrasew.com`

2. **src/services/listingsAPI.js**
   - Listings-specific API
   - Default: `https://api.yesrasew.com/api`

3. **src/api/index.js**
   - Axios-based API client
   - Default: `https://api.yesrasew.com/api`

## Security Best Practices

### ✅ DO:
- Use environment variables for all API URLs
- Keep `.env.local` in `.gitignore`
- Use different keys for development and production
- Rotate keys regularly
- Use HTTPS in production

### ❌ DON'T:
- Commit `.env` files to git
- Use production keys in development
- Hardcode API URLs in source code
- Share environment variables publicly
- Use localhost URLs in production builds

## Verification

### Check Current Configuration
```javascript
// In browser console
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
```

### Test API Connection
```javascript
// In browser console
fetch(process.env.REACT_APP_API_URL + '/health')
  .then(r => r.json())
  .then(console.log);
```

## Troubleshooting

### Issue: "API_URL is undefined"
**Solution**: Ensure environment variables start with `REACT_APP_`

### Issue: "Cannot connect to localhost in production"
**Solution**: Check that environment variables are set in hosting platform

### Issue: "Environment variables not updating"
**Solution**: 
1. Restart development server
2. Clear browser cache
3. Rebuild the application

### Issue: "Different values in dev vs prod"
**Solution**: 
- Development uses `.env.local`
- Production uses hosting platform environment variables
- Ensure both are set correctly

## Migration Checklist

When deploying to production:

- [ ] Set `REACT_APP_API_URL` in hosting platform
- [ ] Set `REACT_APP_SUPABASE_URL` in hosting platform
- [ ] Set `REACT_APP_SUPABASE_ANON_KEY` in hosting platform
- [ ] Verify no hardcoded localhost URLs remain
- [ ] Test API connectivity in production
- [ ] Verify Supabase connection works
- [ ] Check browser console for errors
- [ ] Test all API endpoints
- [ ] Verify image uploads work
- [ ] Test authentication flow

## Additional Resources

- [Create React App - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Supabase - Client Libraries](https://supabase.com/docs/reference/javascript/installing)
- [Vercel - Environment Variables](https://vercel.com/docs/environment-variables)
- [Netlify - Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)

---

**Last Updated**: December 24, 2024
**Status**: ✅ Production Ready
