# Compact Product Cards

## Overview

The platform uses compact product cards throughout the homepage to maximize product visibility and improve user experience.

## Design Specifications

### Card Dimensions
- **Width:** 140px (fixed)
- **Height:** ~200px (dynamic)
- **Image Area:** 120px height
- **Gap Between Cards:** 8px

### Typography
- **Product Name:** 12px (text-xs), 2 lines max
- **Price:** 14px (text-sm), bold
- **Brand:** 10px
- **Stock/Rating:** 10px

### Components
1. **Image Container:** 120px × 120px with 8px padding
2. **Add to Cart Button:** 24px circular, bottom-right
3. **Discount Badge:** Top-left corner (if applicable)
4. **Product Info:** Name, brand, price, stock, rating

## Features

### Product Information
- **Name:** Truncated to 2 lines with ellipsis
- **Price:** Current price in KES
- **Old Price:** Strikethrough if on sale
- **Brand:** Brand name below product name
- **Stock Status:** In Stock / Out of Stock indicator
- **Rating:** 5-star rating display
- **Discount:** Percentage badge for sales

### Interactive Elements
- **Add to Cart:** Circular + button
- **Card Link:** Entire card clickable to product detail
- **Hover Effect:** Subtle shadow on hover

### Responsive Behavior
- **Desktop (1920px):** ~12 cards visible
- **Tablet (768px):** ~5 cards visible
- **Mobile (375px):** 2.5 cards visible

## Usage Locations

Cards are used in these homepage sections:
1. ✅ Recommended For You
2. ✅ Offers you cannot miss
3. ✅ Lowest Prices Everyday
4. ✅ Best Sellers
5. ✅ Featured Products

## Image Sizing

### Problem Solved
Images were appearing too large and breaking layout.

### Solution
```tsx
<img
  src={imageUrl}
  alt={productName}
  loading="lazy"
  className="max-w-full max-h-full object-contain"
  style={{ maxWidth: '100%', maxHeight: '100%' }}
/>
```

**Key Features:**
- `object-contain` - Maintains aspect ratio
- Dual constraints (CSS + inline style)
- Centered within container
- Lazy loading for performance

### Image Behavior
- **Tall images:** Constrained by height (104px)
- **Wide images:** Constrained by width (124px)
- **Small images:** Centered, not stretched
- **Large images:** Scaled down proportionally

## Performance

### Benefits
- Smaller cards = more products visible
- Less scrolling required
- Faster product discovery
- Better mobile experience

### Optimization
- Lazy loading for images
- Efficient rendering with React
- Minimal re-renders
- Smooth carousel scrolling

## Accessibility

### Standards Met
- WCAG 2.1 AA compliant
- Minimum touch target: 24px
- High contrast text
- Screen reader friendly
- Keyboard navigable

### Features
- Alt text for images
- Aria labels for buttons
- Semantic HTML
- Focus indicators

## Customization

### Modifying Card Size
Edit `CompactProductCard.tsx`:
```tsx
style={{ width: '140px' }}  // Change width
style={{ height: '120px' }}  // Change image height
```

### Changing Gap
Edit `ProductCarousel.tsx`:
```tsx
<div className="flex gap-2">  // Change gap-2 to gap-3, gap-4, etc.
```

### Typography
Adjust font sizes in component:
- `text-xs` → `text-sm` (12px → 14px)
- `text-sm` → `text-base` (14px → 16px)

## Testing

### Visual Checks
- [ ] Cards render at 140px width
- [ ] Images properly constrained
- [ ] Text doesn't overflow
- [ ] Consistent spacing
- [ ] Proper alignment across rows

### Functional Checks
- [ ] Add to cart works
- [ ] Card link navigates correctly
- [ ] Hover effects smooth
- [ ] Carousel scrolls properly
- [ ] Lazy loading works

### Cross-Browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Chrome Mobile

## Troubleshooting

**Q: Images too big?**  
A: Check `maxWidth` and `maxHeight` styles applied

**Q: Cards different sizes?**  
A: Verify fixed width is set

**Q: Text overflowing?**  
A: Check line-clamp and truncate classes

**Q: Gap too wide/narrow?**  
A: Adjust gap-2 in carousel container

**Q: Cards not scrolling?**  
A: Check Embla carousel initialization
