# Vercel Environment Variables Setup

## Required Environment Variables

Your frontend React/Vite app needs the following environment variables set in Vercel:

### 1. **VITE_API_URL** (Required)
- **Value**: `https://movec-api.fly.dev`
- **Description**: The backend API URL hosted on Fly.io
- **Used in**: API calls, authentication, all backend communication

### 2. **VITE_STRIPE_PUBLIC_KEY** (Required)
- **Value**: `pk_test_51TvA0jFsOqQCYASQpobnD56wdfweQjkBDbFY1JlSGzCyqUDZpyPXo00GwBXiWcystdH7AyDWblW3PL9EGq9ZZITr008DMaF3rf`
- **Description**: Stripe publishable key for payment processing
- **Used in**: Checkout and payment pages

---

## How to Set Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to your Vercel project**:
   - Visit https://vercel.com/dashboard
   - Select your `frontend` project

2. **Navigate to Settings**:
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add the variables**:

   **Variable 1:**
   - **Name**: `VITE_API_URL`
   - **Value**: `https://movec-api.fly.dev`
   - **Environment**: Check all (Production, Preview, Development)
   - Click **Save**

   **Variable 2:**
   - **Name**: `VITE_STRIPE_PUBLIC_KEY`
   - **Value**: `pk_test_51TvA0jFsOqQCYASQpobnD56wdfweQjkBDbFY1JlSGzCyqUDZpyPXo00GwBXiWcystdH7AyDWblW3PL9EGq9ZZITr008DMaF3rf`
   - **Environment**: Check all (Production, Preview, Development)
   - Click **Save**

4. **Redeploy**:
   - Go to **Deployments** tab
   - Click the three dots ⋮ on your latest deployment
   - Click **Redeploy**
   - Check **Use existing Build Cache** (optional)
   - Click **Redeploy**

---

### Method 2: Via Vercel CLI

```bash
cd frontend

# Add API URL
vercel env add VITE_API_URL

# When prompted, enter: https://movec-api.fly.dev
# Select: Production, Preview, Development (use spacebar to select all)

# Add Stripe key
vercel env add VITE_STRIPE_PUBLIC_KEY

# When prompted, enter: pk_test_51TvA0jFsOqQCYASQpobnD56wdfweQjkBDbFY1JlSGzCyqUDZpyPXo00GwBXiWcystdH7AyDWblW3PL9EGq9ZZITr008DMaF3rf
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

---

### Method 3: Via `.env` file (Local Development Only)

**Do NOT commit this file to Git!**

Create `frontend/.env.production`:

```env
VITE_API_URL=https://movec-api.fly.dev
VITE_STRIPE_PUBLIC_KEY=pk_test_51TvA0jFsOqQCYASQpobnD56wdfweQjkBDbFY1JlSGzCyqUDZpyPXo00GwBXiWcystdH7AyDWblW3PL9EGq9ZZITr008DMaF3rf
```

---

## Verify Environment Variables

After setting the variables and redeploying:

1. **Check Build Logs**:
   - Go to your deployment in Vercel
   - Check if build was successful

2. **Test the App**:
   - Visit your deployed URL
   - Open browser DevTools → Network tab
   - Check that API calls go to `https://movec-api.fly.dev`

3. **Common Issues**:
   - If API calls go to `localhost:4000` → Variables not set correctly
   - If you get CORS errors → Check backend CORS settings
   - If Stripe doesn't load → Check Stripe key is correct

---

## Important Notes

### ⚠️ Vite Environment Variable Rules

1. **Must start with `VITE_`**: Only variables prefixed with `VITE_` are exposed to the client
2. **Set at build time**: Environment variables are embedded during build
3. **Redeploy required**: Changes require a full redeploy

### 🔒 Security

- **Never commit** `.env` or `.env.local` files to Git
- These are **client-side** variables (visible in browser)
- Don't put sensitive secrets here (API secrets, private keys)
- Stripe **publishable** key is safe to expose (starts with `pk_`)

### 🔄 When to Update

Update `VITE_API_URL` if:
- Backend moves to a different domain
- Switching between staging and production

Update `VITE_STRIPE_PUBLIC_KEY` if:
- Moving from test to live mode
- Switching Stripe accounts

---

## Current Configuration

✅ **Backend API**: https://movec-api.fly.dev (Fly.io)
✅ **Frontend**: Vercel (your-domain.vercel.app)
✅ **Stripe**: Test mode

---

## Backend CORS Configuration

Make sure your backend `.env` on Fly.io has:

```env
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

Or update it to allow your Vercel domain:

```bash
fly secrets set FRONTEND_URL="https://your-vercel-domain.vercel.app" --app movec-api
```

Replace `your-vercel-domain.vercel.app` with your actual Vercel deployment URL.

---

## Quick Reference

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_URL` | `https://movec-api.fly.dev` | ✅ Yes |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_51TvA0j...` | ✅ Yes |

---

## Troubleshooting

### Build fails with "import.meta.env.VITE_API_URL is undefined"
- Environment variables not set in Vercel
- Solution: Add variables and redeploy

### API calls fail with CORS error
- Backend doesn't allow your Vercel domain
- Solution: Update `FRONTEND_URL` in Fly.io secrets

### Stripe checkout doesn't work
- Wrong Stripe key
- Solution: Verify key in Vercel environment variables

---

## Next Steps

1. ✅ Set both environment variables in Vercel
2. ✅ Redeploy your frontend
3. ✅ Update backend `FRONTEND_URL` to your Vercel URL
4. ✅ Test the deployed app
5. ✅ Replace test Stripe key with live key when ready for production
