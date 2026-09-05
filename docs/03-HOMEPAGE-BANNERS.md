# Homepage Banner Management

## Overview

The homepage features a dynamic hero carousel that displays promotional banners. Admins can create, edit, and manage these banners through the admin dashboard.

## Features

- Create/Edit/Delete banners
- Link banners to products for live pricing
- Customize colors and styling
- Set display order
- Toggle active/inactive status
- Preview before publishing

## Admin Access

1. Login as admin
2. Go to Admin Dashboard
3. Click "Edit Homepage" button
4. Or navigate to `/admin/homepage`

## Creating a Banner

### Required Fields
- **Title:** Main headline (e.g., "Starlink Gen 3 Available!")
- **CTA Text:** Button text (e.g., "Shop Now")
- **CTA Link:** Button destination (e.g., `/products/starlink`)
- **Background Color:** Banner background
- **Text Color:** Text color on banner
- **Sort Order:** Display order (0, 1, 2, etc.)

### Optional Fields
- **Subtitle:** Supporting text
- **Badge:** Small label (e.g., "NEW", "HOT DEAL")
- **Badge Color:** Color for badge
- **Image URL:** Banner background image
- **Product:** Link to product for live pricing

### Steps
1. Click "Add Banner"
2. Fill in the form
3. Pick colors using color pickers
4. Select product (optional)
5. Set sort order
6. Check "Active" to show immediately
7. Click "Create"

## Managing Banners

### Edit a Banner
1. Find banner in list
2. Click "Edit" button
3. Modify fields
4. Click "Update"

### Toggle Active/Inactive
- Click green "Active" or gray "Inactive" button
- Changes apply immediately
- Inactive banners won't show on homepage

### Delete a Banner
1. Click red "Delete" button
2. Confirm deletion
3. Banner removed permanently

### Reorder Banners
- Edit banner's "Sort Order" field
- Lower numbers appear first (0, 1, 2, ...)
- Changes apply on homepage immediately

## Live Product Pricing

When you link a banner to a product:
- Banner shows the product's current price
- Price auto-updates when you change product price
- No manual banner updates needed
- Perfect for featured promotions

**Example:**
- Link banner to "Starlink Gen 3 Kit"
- Banner shows: "KES 45,000"
- Update product price to KES 42,000
- Banner automatically updates to: "KES 42,000"

## Color Customization

Use color pickers to:
- Set background color
- Set text color
- Set badge color (if using badge)

**Tips:**
- Ensure good contrast for readability
- Test on both desktop and mobile
- Use brand colors for consistency

## Best Practices

### Content
- Keep titles short and impactful
- Use clear CTAs ("Shop Now", "Learn More")
- Highlight key benefits in subtitle
- Use badges sparingly

### Design
- Use high-quality images
- Maintain consistent branding
- Ensure text is readable on background
- Test on different screen sizes

### Management
- Keep 3-5 active banners maximum
- Update regularly for freshness
- Remove expired promotions
- Monitor which banners drive clicks

## Frontend Integration Status

⚠️ **Current Status:** Backend complete, frontend integration pending

The admin interface is fully functional and banners are saved to the database. However, the homepage carousel still shows hardcoded banners.

**To complete integration:**
1. Update Home.tsx hero carousel
2. Fetch from `/promo-banners` endpoint
3. Map dynamic banners to carousel
4. Show live product prices
5. Use dynamic colors

See `DYNAMIC_HOMEPAGE_IMPLEMENTATION.md` for technical details.

## Troubleshooting

**Q: Can't access banner management?**  
A: Ensure you're logged in as admin

**Q: Changes don't save?**  
A: Check browser console, verify backend is running

**Q: Banners don't show on homepage?**  
A: Frontend integration is pending

**Q: Can't delete banner?**  
A: Confirm deletion dialog, check backend logs

**Q: Product dropdown empty?**  
A: Ensure products exist in database
