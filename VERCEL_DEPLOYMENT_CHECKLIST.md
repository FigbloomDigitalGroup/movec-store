# ✅ Vercel Deployment Checklist

## Before You Start

- [x] Code pushed to GitHub: `https://github.com/Joseph-Wachira/movec-store.git`
- [x] Local Vercel config cleaned up
- [x] Backend deployed to Fly.io: `https://movec-api.fly.dev`

---

## Deployment Steps

### 1. Import Project to Vercel

Visit: **https://vercel.com/new**

- [ ] Click **"Import Git Repository"**
- [ ] Connect to GitHub (if not already connected)
- [ ] Search for: `movec-store`
- [ ] Click **"Import"**

---

### 2. Configure Project Settings

**⚠️ IMPORTANT SETTINGS:**

#### Root Directory
- [ ] Click **"Edit"** next to Root Directory
- [ ] Set to: **`frontend`** ← This is critical!

#### Framework Preset
- [ ] Should auto-detect as **Vite**
- [ ] If not, select **Vite** from dropdown

#### Build Settings (should auto-detect)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

### 3. Add Environment Variables

**Before clicking Deploy**, expand **"Environment Variables"** section:

#### Variable 1: Backend API URL
```
Name: VITE_API_URL
Value: https://movec-api.fly.dev
Environments: ✓ Production ✓ Preview ✓ Development
```
- [ ] Name entered
- [ ] Value entered
- [ ] All environments selected
- [ ] Clicked "Add"

#### Variable 2: Stripe Public Key
```
Name: VITE_STRIPE_PUBLIC_KEY
Value: pk_test_51TvA0jFsOqQCYASQpobnD56wdfweQjkBDbFY1JlSGzCyqUDZpyPXo00GwBXiWcystdH7AyDWblW3PL9EGq9ZZITr008DMaF3rf
Environments: ✓ Production ✓ Preview ✓ Development
```
- [ ] Name entered
- [ ] Value entered
- [ ] All environments selected
- [ ] Clicked "Add"

---

### 4. Deploy

- [ ] Click **"Deploy"** button
- [ ] Wait for build to complete (1-3 minutes)
- [ ] Build successful ✅
- [ ] Copy your production URL: `https://_____________.vercel.app`

---

### 5. Update Backend CORS

Once you have your Vercel URL, run this command:

```powershell
fly secrets set FRONTEND_URL="https://YOUR_VERCEL_URL.vercel.app" --app movec-api
```

- [ ] Command executed
- [ ] Backend restarted with new FRONTEND_URL

---

## Testing Your Deployment

Visit your Vercel URL and test:

- [ ] Homepage loads correctly
- [ ] Can browse products
- [ ] Can register a new account
- [ ] Can login
- [ ] Can add items to cart
- [ ] Can proceed to checkout
- [ ] Stripe checkout loads
- [ ] Can complete test payment (card: 4242 4242 4242 4242)

**Open DevTools → Network tab:**
- [ ] API calls go to `https://movec-api.fly.dev` (NOT localhost)
- [ ] No CORS errors
- [ ] No 404 errors on route changes

---

## Troubleshooting

### If build fails:
1. Check build logs in Vercel dashboard
2. Verify Root Directory is set to `frontend`
3. Check if all dependencies are in `package.json`

### If API calls fail:
1. Verify `VITE_API_URL` is set correctly
2. Check that all environments are selected
3. Redeploy if you added variables after initial deploy

### If CORS errors:
1. Verify backend `FRONTEND_URL` is set to your Vercel URL
2. Check backend is running: `https://movec-api.fly.dev`
3. Try accessing: `https://movec-api.fly.dev/api/health`

### If Stripe doesn't work:
1. Verify `VITE_STRIPE_PUBLIC_KEY` is set
2. Check browser console for errors
3. Verify key starts with `pk_test_`

---

## Quick Reference

**GitHub Repository**: https://github.com/Joseph-Wachira/movec-store
**Backend API**: https://movec-api.fly.dev
**Vercel Dashboard**: https://vercel.com/dashboard

**Environment Variables**:
```
VITE_API_URL=https://movec-api.fly.dev
VITE_STRIPE_PUBLIC_KEY=pk_test_51TvA0jFsOqQCYASQpobnD56wdfweQjkBDbFY1JlSGzCyqUDZpyPXo00GwBXiWcystdH7AyDWblW3PL9EGq9ZZITr008DMaF3rf
```

---

## After Successful Deployment

- [ ] Bookmark your Vercel URL
- [ ] Test all features thoroughly
- [ ] Share URL with team/testers
- [ ] Monitor deployments in Vercel dashboard
- [ ] Set up custom domain (optional)

---

**🎉 You're all set! Good luck with your deployment!**

Remember: Future pushes to `main` branch will automatically deploy to Vercel.
