# Deployment Guide

## Overview

- **Backend:** Deployed on Render
- **Frontend:** Deployed on Vercel
- **Database:** PostgreSQL on Render

## Backend Deployment (Render)

### 1. Prepare Repository
Ensure `backend/package.json` has:
```json
{
  "scripts": {
    "build": "nest build",
    "start": "node dist/src/main.js",
    "start:prod": "node dist/src/main.js"
  }
}
```

### 2. Create Render Service
1. Go to render.com
2. Create New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Name:** movec-backend
   - **Environment:** Node
   - **Root Directory:** backend
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm run start:prod`

### 3. Add Environment Variables
```env
DATABASE_URL=<render-postgresql-url>
JWT_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<another-strong-random-string>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
NODE_ENV=production
PORT=3000
```

### 4. Database Setup
```bash
# After first deploy, run migrations
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

## Frontend Deployment (Vercel)

### 1. Connect Repository
1. Go to vercel.com
2. Import Git Repository
3. Select your repository

### 2. Configure Build Settings
- **Framework:** Vite
- **Root Directory:** frontend
- **Build Command:** `npm run build`
- **Output Directory:** dist

### 3. Environment Variables
```env
VITE_API_URL=https://your-backend.onrender.com
```

### 4. Deploy
Click "Deploy" and wait for build to complete.

## Custom Domain Setup

### Backend (Render)
1. Go to service settings
2. Add custom domain
3. Update DNS records as instructed

### Frontend (Vercel)
1. Go to project settings → Domains
2. Add your domain
3. Configure DNS:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

## Post-Deployment Checklist

- [ ] Backend health check: `https://your-api.com/`
- [ ] Frontend loads successfully
- [ ] Admin login works
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Email notifications sent
- [ ] Image uploads work

## Monitoring

### Backend Logs
- View in Render dashboard
- Check for errors during migration
- Monitor API response times

### Frontend Logs
- View in Vercel dashboard
- Check browser console for errors
- Monitor build times

## Rollback Procedure

### Backend
1. Go to Render dashboard
2. Select previous deployment
3. Click "Rollback to this version"

### Frontend
1. Go to Vercel dashboard
2. Select Deployments tab
3. Click "..." on previous deployment
4. Select "Promote to Production"

## Troubleshooting

### Backend Issues
- **Migration fails:** Check DATABASE_URL
- **Build fails:** Verify package.json scripts
- **API not responding:** Check logs for errors

### Frontend Issues
- **Build fails:** Check for TypeScript errors
- **API calls fail:** Verify VITE_API_URL
- **Blank page:** Check browser console

### Database Issues
- **Connection timeout:** Check database status
- **Migration conflicts:** Resolve manually
- **Out of connections:** Upgrade database plan
