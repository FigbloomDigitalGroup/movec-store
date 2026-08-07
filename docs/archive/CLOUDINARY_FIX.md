# Cloudinary API Key Issue - SOLUTION

## Problem Found
The image upload is failing with a **401 Unauthorized** error from Cloudinary:

```
Cloudinary upload error: {
  message: 'Unknown API key q7FykKMOMfs84AfiOONSKrXyksc',
  http_code: 401
}
```

This means the `CLOUDINARY_API_KEY` stored in Fly.io is **incorrect or invalid**.

## Solution

You need to update your Cloudinary credentials in Fly.io with the correct values from your Cloudinary account.

### Step 1: Get Your Cloudinary Credentials

1. Go to https://cloudinary.com/console
2. Log in to your Cloudinary account
3. On the dashboard, you'll see your credentials:
   - **Cloud name**: (e.g., `dxxxxx`)
   - **API Key**: (22 digits, e.g., `123456789012345678901`)
   - **API Secret**: (long string, e.g., `aBcDeFgHiJkLmNoPqRsTuVwXyZ`)

### Step 2: Update Fly.io Secrets

Run these commands from the `backend` directory:

```bash
cd backend

# Update Cloud Name
fly secrets set CLOUDINARY_CLOUD_NAME="your-cloud-name" --app movec-api

# Update API Key  
fly secrets set CLOUDINARY_API_KEY="your-api-key" --app movec-api

# Update API Secret
fly secrets set CLOUDINARY_API_SECRET="your-api-secret" --app movec-api
```

Replace:
- `your-cloud-name` with your actual Cloudinary cloud name
- `your-api-key` with your actual API key (22 digits)
- `your-api-secret` with your actual API secret

### Step 3: Verify the Update

After setting the secrets, Fly.io will automatically restart your app. Wait about 30 seconds, then try uploading images again.

## Example Commands

```bash
# Example (use YOUR actual credentials):
fly secrets set CLOUDINARY_CLOUD_NAME="dmycloud" --app movec-api
fly secrets set CLOUDINARY_API_KEY="123456789012345678901" --app movec-api  
fly secrets set CLOUDINARY_API_SECRET="aBcDeFgHiJkLmNoPqRsTuVwXyZ" --app movec-api
```

## Quick Check

To verify your current secrets are set:
```bash
fly secrets list --app movec-api
```

## After Fixing

Once you've updated the secrets:
1. Wait 30-60 seconds for the app to restart
2. Go to your admin panel
3. Try uploading images again
4. The images should now upload successfully!

## Note

The current API key `q7FykKMOMfs84AfiOONSKrXyksc` is **invalid**. Make sure you copy the correct credentials from your Cloudinary dashboard.
