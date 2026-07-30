# 🚀 Deploy Frontend to Vercel via GitHub

## Prerequisites Checklist

✅ GitHub Repository: `https://github.com/Joseph-Wachira/movec-store.git`
✅ Local Vercel config cleaned up
✅ Frontend code in `/frontend` directory
✅ Backend deployed to Fly.io: `https://movec-api.fly.dev`

---

## Step-by-Step Deployment Guide

### Step 1: Push Latest Code to GitHub

Before deploying, make sure all your latest code is on GitHub:

```powershell
cd c:\Users\Admin\Desktop\Projects\Movec

# Check current status
git status

# Add any changes
git add .

# Commit changes
git commit -m "Prepare frontend for Vercel deployment"

# Push to GitHub
git push origin main
```

---

### Step 2: Import Project to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Or: https://vercel.com/dashboard → Click "Add New..." → "Project"

2. **Import Git Repository**
   - Click **"Import Git Repository"**
   - Select **GitHub** as the provider
   - If not connected, click **"Connect GitHub Account"** and authorize Vercel
   - Search for: `movec-store` or `Joseph-Wachira/movec-store`
   - Click **"Import"** next to your repository

3. **Configure Project**

   **Project Name**: `movec-store` or `movec-frontend` (your choice)
   
   **Framework Preset**: Vite (should auto-detect)
   
   **Root Directory**: 
   - ⚠️ **IMPORTANT**: Click **"Edit"** next to Root Directory
   - Set to: `frontend`
   - This tells Vercel your app is in the `/frontend` folder, not the root
   
   **Build and Output Settings** (should auto-detect, but verify):
   - Build Command: `npm run build` or `vite build`
   - Output Directory: `dist`
   - Install Command: `npm install`

---

### Step 3: Add Environment Variables

**Before deploying**, expand the **"Environment Variables"** section and add these:

#### Variable 1: API URL
- **Name**: `VITE_API_URL`
- **Value**: `https://movec-api.fly.dev`
- **Environment**: Select all (Production, Preview, Development)

#### Variable 2: Stripe Public Key
- **Name**: `VITE_STRIPE_PUBLIC_KEY`
- **Value**: `pk_test_51TvA0jFsOqQCYASQpobnD56wdfweQjkBDbFY1JlSGzCyqUDZpyPXo00GwBXiWcystdH7AyDWblW3PL9EGq9ZZITr008DMaF3rf`
- **Environment**: Select all (Production, Preview, Development)

---

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 1-3 minutes)
3. Once deployed, you'll get your production URL like:
   - `https://movec-store.vercel.app` or
   - `https://movec-frontend-xyz.vercel.app`

---

## Step 5: Add Custom Domain

After initial deployment:

1. **Go to Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `movecstore.movecconnect.com`
4. Follow DNS configuration instructions
5. Add CNAME record in your DNS provider:
   ```
   Type: CNAME
   Name: movecstore
   Value: cname.vercel-dns.com.
   ```
6. Wait for DNS propagation and SSL provisioning

**See `CUSTOM_DOMAIN_SETUP.md` for detailed instructions.**

---

## Step 6: Update Backend CORS

Once your custom domain is configured:

```powershell
# Set your custom domain as the frontend URL
fly secrets set FRONTEND_URL="https://movecstore.movecconnect.com" --app movec-api

# Or include both custom and Vercel URLs
fly secrets set FRONTEND_URL="https://movecstore.movecconnect.com,https://YOUR_VERCEL_URL.vercel.app" --app movec-api
```

---

## Configuration Files Explained

Your project already has the necessary config files:

### 1. `frontend/vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This ensures React Router works correctly (all routes go to index.html).

### 2. `frontend/vite.config.ts`
Already configured with proper build settings and code splitting.

### 3. `frontend/.env`
Contains the Stripe key for local development (not used in Vercel).

---

## Automatic Deployments

Once connected to GitHub, Vercel will automatically deploy:

- **Production deployments**: When you push to `main` branch
- **Preview deployments**: When you push to other branches or open PRs
- **Instant rollbacks**: Available in Vercel dashboard

---

## Testing Your Deployment

After deployment completes:

1. ✅ Visit your Vercel URL
2. ✅ Open browser DevTools → Network tab
3. ✅ Try to register/login
4. ✅ Verify API calls go to `https://movec-api.fly.dev`
5. ✅ Test adding items to cart
6. ✅ Test checkout with Stripe (use test card: 4242 4242 4242 4242)

---

## Common Issues & Solutions

### Issue 1: "Root directory not found"
**Problem**: Vercel is looking in wrong directory
**Solution**: Make sure Root Directory is set to `frontend` in project settings

### Issue 2: Build fails with "command not found"
**Problem**: Wrong build command
**Solution**: Set Build Command to `npm run build` (Vercel runs this from the `frontend` directory)

### Issue 3: API calls go to localhost
**Problem**: Environment variables not set
**Solution**: Add both `VITE_API_URL` and `VITE_STRIPE_PUBLIC_KEY` in Vercel dashboard

### Issue 4: CORS errors in production
**Problem**: Backend doesn't allow Vercel domain
**Solution**: Update `FRONTEND_URL` in Fly.io secrets with your Vercel URL

### Issue 5: Blank page after deployment
**Problem**: React Router not configured properly
**Solution**: Verify `vercel.json` exists with the rewrite rule

---

## Project Settings Overview

After deployment, you can modify settings:

**Vercel Dashboard → Your Project → Settings**

- **General**: Change project name, transfer ownership
- **Git**: Change branch, root directory
- **Environment Variables**: Add/edit/delete variables
- **Domains**: Add custom domains
- **Build & Development**: Change build commands, node version

---

## Environment Variables Reference

| Variable | Value | Required | Purpose |
|----------|-------|----------|---------|
| `VITE_API_URL` | `https://movec-api.fly.dev` | ✅ Yes | Backend API endpoint |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_51TvA0j...` | ✅ Yes | Stripe payment processing |

**Note**: Variables starting with `VITE_` are embedded at build time and visible in browser.

---

## GitHub Integration Benefits

✅ **Automatic deployments** on every push
✅ **Preview URLs** for every branch/PR
✅ **Commit-based rollbacks** 
✅ **Build status** in GitHub PRs
✅ **Team collaboration** with preview comments

---

## Custom Domain

Your custom domain: **movecstore.movecconnect.com**

After deployment, add your custom domain:

1. Go to **Project Settings** → **Domains**
2. Add domain: `movecstore.movecconnect.com`
3. Configure DNS CNAME record in your DNS provider
4. Wait for SSL certificate provisioning
5. Update backend `FRONTEND_URL` to `https://movecstore.movecconnect.com`

**See `CUSTOM_DOMAIN_SETUP.md` for complete setup guide.**

---

## Monitoring & Analytics

Vercel provides built-in monitoring:

- **Analytics**: View page views, visitors, countries
- **Speed Insights**: Track Core Web Vitals
- **Logs**: View build and function logs
- **Deployments**: Track all deployments and rollback if needed

---

## Quick Reference Commands

```powershell
# Push changes to trigger deployment
git add .
git commit -m "Update frontend"
git push origin main

# Create a preview branch
git checkout -b feature/new-feature
git push origin feature/new-feature
# Vercel automatically creates preview URL
```

---

## Troubleshooting Checklist

If your deployment fails or doesn't work:

- [ ] Root directory set to `frontend`
- [ ] Both environment variables added
- [ ] All environments selected for variables (Production, Preview, Development)
- [ ] Latest code pushed to GitHub
- [ ] `vercel.json` exists in frontend folder
- [ ] Backend CORS updated with Vercel URL
- [ ] No build errors in Vercel dashboard

---

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Vite on Vercel**: https://vercel.com/docs/frameworks/vite
- **GitHub Repository**: https://github.com/Joseph-Wachira/movec-store
- **Backend API**: https://movec-api.fly.dev

---

## Next Steps After Successful Deployment

1. ✅ Test all features (auth, cart, checkout)
2. ✅ Add custom domain (optional)
3. ✅ Set up Vercel Analytics (optional)
4. ✅ Configure branch protection rules on GitHub
5. ✅ Switch Stripe from test to live mode when ready
6. ✅ Update `VITE_STRIPE_PUBLIC_KEY` to live key in production

---

**Good luck with your deployment! 🚀**

Your app will be live at: `https://[project-name].vercel.app`
