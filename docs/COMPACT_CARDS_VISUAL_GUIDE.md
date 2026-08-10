# Compact Product Cards - Visual Guide

## Card Anatomy

```
┌─────────────────────────────────┐
│  [20% OFF]  ← Discount Badge    │  ← 180px width
│                                  │
│  ┌───────────────────────────┐  │
│  │                           │  │  ← 160px height
│  │    Product Image          │  │     (Fixed)
│  │   (object-fit: contain)   │  │
│  │                           │  │
│  │                    [+]    │  │  ← Add to cart button
│  └───────────────────────────┘  │
│                                  │
│  Product Name Here              │  ← 2 lines max
│  Truncated if too long...      │
│                                  │
│  Brand Name                     │  ← Gray text, 12px
│                                  │
│  2,499 KES                      │  ← Bold price
│  3,999 KES                      │  ← Strikethrough old price
│                                  │
│  ● In Stock                     │  ← Green/Red indicator
│                                  │
│  ★★★★☆ (4.0)                   │  ← Star rating
│                                  │
└─────────────────────────────────┘
```

## Carousel Layout

### Desktop View (1024px+)
```
┌────────────────────────────────────────────────────────────────────┐
│  Recommended For You                              See All →         │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [◄]  [Card1] [Card2] [Card3] [Card4] [Card5] [Card6] [Card7]  [►]│
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

### Tablet View (768px - 1023px)
```
┌────────────────────────────────────────────────┐
│  Recommended For You           See All →        │
├────────────────────────────────────────────────┤
│                                                 │
│  [◄]  [Card1] [Card2] [Card3] [Card4] [Card5]  │
│                                          [►]    │
└────────────────────────────────────────────────┘
```

### Mobile View (< 768px)
```
┌──────────────────────────────────┐
│  Recommended For You  See All →  │
├──────────────────────────────────┤
│                                  │
│  [Card1] [Card2] [Card3]         │
│                                  │
│  ← Swipe to see more →          │
└──────────────────────────────────┘
```

## Color Palette

### Card Colors
- **Background:** `#FFFFFF` (white)
- **Border:** `#E5E7EB` (gray-200)
- **Hover Shadow:** `rgba(0, 0, 0, 0.1)`

### Text Colors
- **Product Name:** `#111827` (gray-900)
- **Brand:** `#6B7280` (gray-500)
- **Price:** `#111827` (gray-900, bold)
- **Old Price:** `#9CA3AF` (gray-400)
- **In Stock:** `#059669` (green-600)
- **Out of Stock:** `#DC2626` (red-500)

### Button Colors
- **Background:** `#2563EB` (blue-600)
- **Hover:** `#1D4ED8` (blue-700)
- **Icon:** `#FFFFFF` (white)

### Badge Colors
- **Discount Badge:** `#DC2626` (red-500)
- **Discount Text:** `#FFFFFF` (white)

## Typography Scale

### Product Name
- **Font Size:** 14px (0.875rem)
- **Font Weight:** 500 (medium)
- **Line Height:** 1.25
- **Max Lines:** 2
- **Color:** gray-900

### Brand Name
- **Font Size:** 12px (0.75rem)
- **Font Weight:** 400 (regular)
- **Color:** gray-500

### Price (Current)
- **Font Size:** 16px (1rem)
- **Font Weight:** 700 (bold)
- **Color:** gray-900

### Price (Old)
- **Font Size:** 12px (0.75rem)
- **Font Weight:** 400 (regular)
- **Text Decoration:** line-through
- **Color:** gray-400

### Stock Status
- **Font Size:** 12px (0.75rem)
- **Font Weight:** 400 (regular)
- **Color:** green-600 or red-500

### Discount Badge
- **Font Size:** 12px (0.75rem)
- **Font Weight:** 700 (bold)
- **Color:** white
- **Background:** red-500

## Spacing & Padding

### Card
- **Width:** 180px (fixed)
- **Border Radius:** 8px
- **Border Width:** 1px
- **Gap Between Cards:** 12px

### Image Container
- **Height:** 160px (fixed)
- **Padding:** 12px all sides
- **Display:** flex center center

### Content Area
- **Padding X:** 12px (left/right)
- **Padding Y:** 12px (top/bottom)
- **Gap Between Elements:** 4px

### Add-to-Cart Button
- **Size:** 32px × 32px
- **Position:** bottom-right of image
- **Offset:** 8px from edges
- **Border Radius:** 50% (circle)
- **Icon Size:** 16px

### Discount Badge
- **Position:** top-left of card
- **Offset:** 8px from edges
- **Padding X:** 8px
- **Padding Y:** 4px
- **Border Radius:** 4px

## Interaction States

### Card Hover
```
Normal State:
- Border: 1px solid gray-200
- Shadow: none

Hover State:
- Border: 1px solid gray-200
- Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
- Transition: 200ms ease
```

### Button Hover
```
Normal State:
- Background: blue-600
- Scale: 1

Hover State:
- Background: blue-700
- Scale: 1 (no scale change)
- Transition: colors 200ms ease
```

### Link States
```
Normal:
- Color: gray-900 (product name)

Hover:
- Color: blue-600 (entire card clickable)
- Cursor: pointer

Focus:
- Outline: 2px solid blue-500
- Outline Offset: 2px
```

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Mobile (default) */
.card-width {
  width: 180px;
}

/* Cards visible: 2-3 */
.carousel-container {
  gap: 12px;
  padding: 0 16px;
}

/* Tablet: 640px and up */
@media (min-width: 640px) {
  /* Cards visible: 3-4 */
  .carousel-container {
    gap: 12px;
    padding: 0 24px;
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  /* Cards visible: 6-7 */
  .carousel-container {
    gap: 12px;
    padding: 0 32px;
  }
  
  .nav-arrows {
    display: flex;
  }
}
```

## Animation Timing

### Card Hover
- **Duration:** 200ms
- **Easing:** ease-out
- **Properties:** box-shadow

### Carousel Scroll
- **Duration:** 300ms
- **Easing:** cubic-bezier(0.16, 1, 0.3, 1)
- **Properties:** transform

### Button Click
- **Duration:** 150ms
- **Easing:** ease-in-out
- **Properties:** background-color

### Image Load
- **Strategy:** lazy loading
- **Fade In:** 200ms ease

## Accessibility

### Keyboard Navigation
```
Tab         → Focus next card/button
Shift+Tab   → Focus previous card/button
Enter       → Activate link/button
Space       → Activate button
Arrow Left  → Scroll carousel left
Arrow Right → Scroll carousel right
```

### ARIA Labels
```html
<button aria-label="Add to cart">
<button aria-label="Previous products">
<button aria-label="Next products">
<section aria-label="Recommended products carousel">
```

### Focus Indicators
- **Outline:** 2px solid blue-500
- **Outline Offset:** 2px
- **Border Radius:** Match element

## Best Practices

### Image Guidelines
1. **Aspect Ratio:** Any (handled by object-fit: contain)
2. **Resolution:** 400px × 400px minimum
3. **Format:** WebP (fallback to JPG/PNG)
4. **Size:** < 100KB optimized
5. **Background:** Transparent or white
6. **Alt Text:** Descriptive product name

### Text Guidelines
1. **Product Name:** 2-60 characters optimal
2. **Brand Name:** 2-20 characters
3. **Price:** Include currency symbol
4. **Stock:** Clear, concise status

### Performance
1. **Lazy Load:** All images
2. **Fixed Dimensions:** No layout shift
3. **Cached Queries:** React Query
4. **Debounce:** Scroll events
5. **Virtual Scrolling:** Large datasets

## Common Patterns

### Loading State
```tsx
{isLoading ? (
  <div className="flex gap-3">
    {[1,2,3,4,5,6].map(i => (
      <div key={i} 
           className="w-[180px] h-[290px] bg-gray-200 
                      rounded-lg animate-pulse" />
    ))}
  </div>
) : (
  <ProductCarousel products={data} />
)}
```

### Empty State
```tsx
{products.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-gray-500">No products available</p>
  </div>
) : (
  <ProductCarousel products={products} />
)}
```

### Error State
```tsx
{error ? (
  <div className="text-center py-12">
    <p className="text-red-500">Error loading products</p>
    <button onClick={refetch}>Try Again</button>
  </div>
) : (
  <ProductCarousel products={data} />
)}
```

## Testing Checklist

### Visual Testing
- [ ] Card dimensions consistent
- [ ] Images centered and contained
- [ ] Text properly truncated
- [ ] Buttons positioned correctly
- [ ] Spacing uniform
- [ ] Colors match design
- [ ] Hover effects work
- [ ] Responsive layout correct

### Functional Testing
- [ ] Add to cart works
- [ ] Navigation arrows work
- [ ] Touch scrolling works
- [ ] Keyboard navigation works
- [ ] Links navigate correctly
- [ ] Loading states display
- [ ] Empty states display
- [ ] Error states display

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

### Accessibility Testing
- [ ] Keyboard only navigation
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] ARIA labels present
- [ ] Semantic HTML used

## Maintenance Checklist

### Regular Checks
- [ ] Image optimization
- [ ] Query performance
- [ ] Bundle size impact
- [ ] Lighthouse scores
- [ ] User analytics
- [ ] Error logs

### Updates Needed
- [ ] Real product ratings
- [ ] Actual delivery times
- [ ] Dynamic stock levels
- [ ] Backend rating integration
- [ ] Wishlist feature
- [ ] Quick view modal

## Design Tokens

```css
:root {
  /* Card Dimensions */
  --card-width: 180px;
  --card-image-height: 160px;
  --card-image-padding: 12px;
  --card-content-padding: 12px;
  --card-gap: 12px;
  
  /* Border Radius */
  --card-radius: 8px;
  --button-radius: 50%;
  --badge-radius: 4px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-smooth: 300ms cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Z-Index */
  --z-badge: 10;
  --z-button: 10;
  --z-arrows: 20;
}
```

## Quick Reference

### Component Structure
```
ProductCarousel
├── Header (title + link)
├── Navigation Arrows
└── Embla Container
    └── CompactProductCard × N
        ├── Discount Badge
        ├── Image Container
        │   ├── Product Image
        │   └── Add Button
        └── Content Area
            ├── Product Name
            ├── Brand
            ├── Prices
            ├── Stock
            └── Rating
```

### Key Files
- `CompactProductCard.tsx` - Card component
- `ProductCarousel.tsx` - Carousel wrapper
- `Home.tsx` - Implementation example
- `types.ts` - Product type definitions

### Dependencies
- `embla-carousel-react` - Carousel
- `react-icons` - Icons
- `react-hot-toast` - Notifications
- `@tanstack/react-query` - Data fetching
- `zustand` - State management
