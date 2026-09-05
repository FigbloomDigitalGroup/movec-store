# 🌐 Custom Domain Setup for Vercel

## Your Custom Domain
**movecstore.movecconnect.com**

---

## Step-by-Step Setup Guide

### Step 1: Deploy to Vercel First

Before adding a custom domain, make sure your project is deployed to Vercel and working with the default Vercel URL (e.g., `movec-store.vercel.app`).

---

### Step 2: Add Domain in Vercel

1. **Go to Your Project**
   - Visit: https://vercel.com/dashboard
   - Select your `movec-store` or `movec-frontend` project

2. **Navigate to Domains**
   - Click **Settings** tab
   - Click **Domains** in the left sidebar

3. **Add Your Domain**
   - Click **"Add Domain"** button
   - Enter: `movecstore.movecconnect.com`
   - Click **"Add"**

---

### Step 3: Configure DNS Records

Vercel will provide DNS configuration instructions. You have two options:

#### Option A: CNAME Record (Recommended for Subdomains)

Add this CNAME record in your DNS provider (where `movecconnect.com` is managed):

```
Type: CNAME
Name: movecstore
Value: cname.vercel-dns.com.
TTL: 3600 (or default)
```

#### Option B: A Record (If CNAME doesn't work)

Add these A records:

```
Type: A
Name: movecstore
Value: 76.76.21.21
TTL: 3600

Type: A
Name: movecstore
Value: 76.76.21.93
TTL: 3600
```

**Note**: Vercel will show you the exact records you need to add in the dashboard.

---

### Step 4: DNS Provider Instructions

#### If using Cloudflare:
1. Log in to Cloudflare dashboard
2. Select `movecconnect.com` domain
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Add the CNAME record as shown by Vercel
6. Set **Proxy status** to **DNS only** (gray cloud, not orange)
7. Click **"Save"**

#### If using GoDaddy:
1. Log in to GoDaddy
2. Go to **My Products** → **Domain**
3. Click **DNS** next to `movecconnect.com`
4. Click **"Add New Record"**
5. Select **CNAME** type
6. Add the record as shown by Vercel
7. Click **"Save"**

#### If using Namecheap:
1. Log in to Namecheap
2. Go to **Domain List** → Manage `movecconnect.com`
3. Click **Advanced DNS** tab
4. Click **"Add New Record"**
5. Select **CNAME Record**
6. Add the record as shown by Vercel
7. Click **"Save"**

#### If using other DNS providers:
Follow their DNS management interface to add the CNAME record provided by Vercel.

---

### Step 5: Verify Domain

1. **Wait for DNS Propagation**
   - Usually takes 5-15 minutes
   - Can take up to 48 hours (rarely)
   - Check status in Vercel dashboard

2. **Check DNS Propagation**
   - Use: https://dnschecker.org
   - Enter: `movecstore.movecconnect.com`
   - Select **CNAME** type
   - Wait until it shows `cname.vercel-dns.com` globally

3. **Verify in Vercel**
   - Vercel will automatically detect when DNS is configured
   - Status will change from ⏳ "Pending" to ✅ "Valid"

---

### Step 6: SSL Certificate

Vercel automatically provisions SSL certificates:

- ✅ **Automatic**: SSL certificate is automatically created
- ✅ **Free**: Let's Encrypt SSL certificate
- ✅ **Auto-renewal**: Certificates auto-renew before expiry
- ⏱️ **Provisioning time**: Usually 1-5 minutes after DNS verification

Wait for the SSL status to show: ✅ **Valid**

---

### Step 7: Update Backend CORS

Once your custom domain is active, update your backend:

```powershell
fly secrets set FRONTEND_URL="https://movecstore.movecconnect.com" --app movec-api
```

**Or include both custom domain and Vercel URL**:
```powershell
fly secrets set FRONTEND_URL="https://movecstore.movecconnect.com,https://movec-store.vercel.app" --app movec-api
```

This allows both URLs to work (useful for testing preview deployments).

---

### Step 8: Test Your Domain

Visit: **https://movecstore.movecconnect.com**

- [ ] Site loads correctly
- [ ] SSL certificate is valid (🔒 in address bar)
- [ ] No mixed content warnings
- [ ] Can login/register
- [ ] API calls work (check DevTools → Network)
- [ ] No CORS errors

---

## Domain Configuration Summary

| Setting | Value |
|---------|-------|
| **Custom Domain** | movecstore.movecconnect.com |
| **DNS Type** | CNAME (recommended) |
| **DNS Value** | cname.vercel-dns.com. |
| **SSL** | Automatic (Let's Encrypt) |
| **Redirect** | www → apex (if configured) |

---

## Troubleshooting

### Domain shows "Invalid Configuration"
**Problem**: DNS not configured correctly
**Solution**: 
- Double-check CNAME record in DNS provider
- Verify record name is `movecstore` (not `movecstore.movecconnect.com`)
- Wait 15-30 minutes for DNS propagation
- Use https://dnschecker.org to verify

### SSL Certificate Pending
**Problem**: Waiting for Let's Encrypt to provision certificate
**Solution**: 
- Wait 5-10 minutes
- Ensure DNS is fully propagated first
- If stuck, remove domain and re-add it

### "This site can't be reached"
**Problem**: DNS not propagated yet
**Solution**: 
- Check DNS with `nslookup movecstore.movecconnect.com`
- Wait longer for propagation
- Clear browser cache and try incognito mode

### CORS Errors
**Problem**: Backend doesn't allow custom domain
**Solution**: 
- Update `FRONTEND_URL` in Fly.io secrets
- Make sure it includes `https://movecstore.movecconnect.com`
- Restart backend if needed

### Mixed Content Warnings
**Problem**: HTTP resources on HTTPS page
**Solution**: 
- Check that all resources use HTTPS
- Verify `VITE_API_URL` is HTTPS
- Clear browser cache

---

## Advanced: Redirect Options

### Redirect www to non-www (if needed)

If you want `www.movecstore.movecconnect.com` to redirect to `movecstore.movecconnect.com`:

1. Add both domains in Vercel:
   - `movecstore.movecconnect.com` (primary)
   - `www.movecstore.movecconnect.com` (will auto-redirect)

2. Add DNS records for www:
   ```
   Type: CNAME
   Name: www.movecstore
   Value: cname.vercel-dns.com.
   ```

---

## DNS Propagation Check Commands

### Windows PowerShell:
```powershell
# Check CNAME record
nslookup -type=CNAME movecstore.movecconnect.com

# Check A record
nslookup movecstore.movecconnect.com

# Flush DNS cache
ipconfig /flushdns
```

### Expected Output:
```
movecstore.movecconnect.com canonical name = cname.vercel-dns.com
```

---

## Security Best Practices

✅ **HTTPS Enforcement**: Vercel automatically redirects HTTP → HTTPS
✅ **HSTS**: HTTP Strict Transport Security enabled by default
✅ **SSL/TLS**: TLS 1.3 supported
✅ **Certificate Auto-renewal**: Automatic via Let's Encrypt

---

## Custom Domain Checklist

- [ ] Domain added in Vercel dashboard
- [ ] DNS CNAME record added
- [ ] DNS propagation verified (dnschecker.org)
- [ ] Vercel shows domain as "Valid"
- [ ] SSL certificate provisioned
- [ ] Site accessible via custom domain
- [ ] Backend CORS updated
- [ ] All features tested on custom domain

---

## Quick Reference

**Custom Domain**: https://movecstore.movecconnect.com
**Vercel Dashboard**: https://vercel.com/dashboard
**DNS Checker**: https://dnschecker.org
**Backend API**: https://movec-api.fly.dev

**DNS Configuration**:
```
Type: CNAME
Name: movecstore
Value: cname.vercel-dns.com.
```

**Backend CORS**:
```powershell
fly secrets set FRONTEND_URL="https://movecstore.movecconnect.com" --app movec-api
```

---

## Support Resources

- **Vercel Custom Domains**: https://vercel.com/docs/concepts/projects/domains
- **DNS Propagation**: https://dnschecker.org
- **SSL Issues**: https://vercel.com/docs/concepts/projects/domains/troubleshooting

---

**🎉 Once configured, your store will be live at: https://movecstore.movecconnect.com**
