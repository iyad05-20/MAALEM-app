# Deployment Guide

This guide covers deploying the Maalem app to production environments.

## Architecture

The application is now separated into:
- **Frontend**: React/Vite PWA on Vercel
- **Backend**: Express API on Heroku (or similar)
- **Shared**: Type definitions and utilities in npm workspaces

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository connected

### Environment Variables (Vercel)
Set these in Vercel project settings:

```
VITE_API_URL=https://maalem-backend.herokuapp.com/api
VITE_WS_URL=https://maalem-backend.herokuapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project
```

### Deploy Steps
1. Push code to GitHub
2. Vercel automatically deploys on push
3. Monitor: https://vercel.com/dashboard

## Backend Deployment (Heroku)

### Prerequisites
- Heroku account
- Heroku CLI installed
- Backend environment variables configured

### Environment Variables (Heroku)
Set these using Heroku CLI or dashboard:

```bash
heroku config:set -a maalem-backend \
  NODE_ENV=production \
  JWT_SECRET=your-production-jwt-secret \
  FRONTEND_URL=https://maalem.vercel.app \
  FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}' \
  FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### First-time Deploy
```bash
# Login to Heroku
heroku login

# Create app
heroku create maalem-backend

# Deploy
git push heroku main

# View logs
heroku logs -a maalem-backend --tail
```

### Subsequent Deploys
```bash
# Just push to Heroku remote
git push heroku main
```

### Monitor Backend
```bash
# View logs
heroku logs -a maalem-backend --tail

# Check dyno status
heroku ps -a maalem-backend

# Scale dynos if needed (after upgrading)
heroku ps:scale web=2 -a maalem-backend
```

## Database Setup

### Firebase
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore, Authentication, Realtime Database
3. Create Service Account:
   - Project Settings → Service Accounts → Generate new private key
   - Copy JSON content to FIREBASE_SERVICE_ACCOUNT env var

### Supabase (Alternative)
1. Create Supabase project
2. Get credentials from project settings
3. Set SUPABASE_URL and SUPABASE_KEY env vars

## CI/CD Pipeline

### GitHub Actions (Future)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Frontend
        run: npm run build:frontend
        
      - name: Deploy Backend
        run: |
          npm run build:backend
          git push heroku main
```

## Monitoring & Maintenance

### Health Checks
- Frontend: Visit https://app-url
- Backend: `curl https://backend-url/health`
- WebSocket: Check real-time features (chat, notifications)

### Performance Optimization
1. Enable CDN caching for static assets (Vercel does this)
2. Use Redis for backend caching (future enhancement)
3. Optimize database queries
4. Monitor response times

### Troubleshooting

**Backend won't start on Heroku:**
```bash
heroku logs -a maalem-backend --tail
# Check for missing env vars or build errors
```

**CORS errors:**
- Verify FRONTEND_URL env var matches deployed frontend URL

**WebSocket connection fails:**
- Check that Heroku dyno type supports WebSockets (not free tier)
- Verify VITE_WS_URL points to correct backend URL

## Rollback Procedures

### Heroku Rollback
```bash
# See recent releases
heroku releases -a maalem-backend

# Rollback to previous version
heroku releases:rollback v42 -a maalem-backend
```

### Vercel Rollback
1. Go to Vercel dashboard
2. Select deployment
3. Click "Rollback" on desired previous deployment

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Firebase credentials stored securely (env vars only)
- [ ] CORS restricted to production frontend URL
- [ ] HTTPS enforced on all endpoints
- [ ] Database backups enabled
- [ ] Environment variables not committed to git
- [ ] Sensitive files in .gitignore

## Cost Optimization

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Heroku**: Free tier no longer available; cheapest is Eco ($5/month)
- **Firebase**: Free tier includes 1GB storage, 100K read operations/day
- **Supabase**: Free tier similar to Firebase

## Next Steps

1. Set up GitHub Actions for automated testing
2. Implement error tracking (Sentry)
3. Set up analytics (Plausible or similar)
4. Configure CDN for static assets
5. Implement automated database backups
