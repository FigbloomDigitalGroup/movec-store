# Compact Product Cards Implementation

## Overview

This document describes the implementation of compact horizontal product cards, similar to popular e-commerce platforms like Amazon and Blinkit. The compact cards provide a space-efficient way to display multiple products in horizontal scrollable carousels.

## Features

### CompactProductCard Component

**Location:** `frontend/src/components/CompactProductCard.tsx`

#### Key Features:
- **Fixed Dimensions:** 180px wide × ~290px tall for consistency
- **Fixed Image Area:** 160px × 160px with centered, contained images
- **Image Handling:** Uses `object-fit: contain` to prevent cropping/stretching
- **Consistent Padding:** 12px padding around images for visual balance
- **Circular Add-to-Cart Button:** Blue circular "+" button at bottom-right of image
- **Truncated Text:** Product name limited to 2 lines with ellipsis
- **Price Display:** Current price, optional strikethrough old price
- **Stock Status:** Visual indicator with color coding (green/red)
- **Discount Badge:** Automatic discount percentage calculation and display
- **Rating Display:** Star rating visualization (4.0 rating placeholder)
- **Responsive Design:** Maintains card dimensions across breakpoints

#### Component Props:
```typescript
interface CompactProductCardProps {
  product: Product;
}
```

#### Card Structure:
1. **Discount Badge** (top-left, conditional)
2. **Image Container** (160px × 160px, centered)
3. **Add-to-Cart Button** (bottom-right of image)
4. **Product Name** (2-line truncated)
5. **Brand Name** (if available)
6. **Price** (current + old price)
7. **Stock Status** (color-coded)
8. **Rating** (stars + score)

### ProductCarousel Component

**Location:** `frontend/src/components/ProductCarousel.tsx`

#### Key Features:
- **Horizontal Scrolling:** Uses Embla Carousel for smooth scrolling
- **Navigation Arrows:** Desktop-only left/right arrows (hidden on mobile)
- **Touch/Swipe Support:** Native touch gestures on mobile devices
- **Responsive Layout:** Shows multiple cards based on screen size
- **Auto-sizing:** Cards maintain consistent width, carousel adapts to container
- **Optional Header:** Title and "See All" link
- **Mobile Hint:** "Swipe to see more" indicator on mobile

#### Component Props:
```typescript
interface ProductCarouselProps {
  products: Product[];
  title?: string;
  viewAllLink?: string;
}
```

#### Carousel Configuration:
```typescript
{
  align: 'start',
  slidesToScroll: 1,
  dragFree: false,
  containScroll: 'trimSnaps',
}
```

## Usage Examples

### Basic Usage

```tsx
import ProductCarousel from '../components/ProductCarousel';

// In your component
<ProductCarousel
  products={recommendedProducts}
  title="Recommended For You"
  viewAllLink="/products"
/>
```

### Home Page Integration

The Home page (`frontend/src/pages/Home.tsx`) now includes three compact card sections:

1. **Recommended For You**
   - Fetches 12 products
   - Gray background section
   - Query key: `['recommended-products']`

2. **Offers you cannot miss**
   - Uses featured products
   - White background section
   - Query key: `['featured-products']`

3. **Lowest Prices Everyday**
   - Sorted by price (ascending)
   - Gray background section
   - Query key: `['lowest-prices']`

### Implementation Example

```tsx
// Add data query
const { data: recommended } = useQuery({
  queryKey: ['recommended-products'],
  queryFn: async () => {
    const { data } = await api.get('/products?limit=12');
    return data.data as Product[];
  },
});

// Add section
{recommended && recommended.length > 0 && (
  <section className="py-10 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ProductCarousel
        products={recommended}
        title="Recommended For You"
        viewAllLink="/products"
      />
    </div>
  </section>
)}
```

## Styling Details

### Card Styling
- **Background:** White (`bg-white`)
- **Border:** Light gray, 1px (`border border-gray-200`)
- **Border Radius:** 8px (`rounded-lg`)
- **Hover Effect:** Elevated shadow (`hover:shadow-md`)
- **Width:** Fixed 180px
- **Spacing:** 12px gap between cards

### Image Container
- **Height:** Fixed 160px
- **Padding:** 12px around image
- **Background:** White
- **Display:** Flex center (both axes)
- **Image Fit:** Contain (no cropping)

### Typography
- **Product Name:** 14px, medium weight, 2-line clamp
- **Brand:** 12px, gray-500
- **Price:** 16px bold (current), 12px line-through (old)
- **Stock:** 12px, color-coded (green/red)
- **Rating:** 12px with star icons

### Button Styling
- **Size:** 32px × 32px circular
- **Color:** Blue-600 background, white icon
- **Hover:** Blue-700 background
- **Icon:** Plus icon, 16px, stroke-width 3
- **Position:** Absolute bottom-right of image area

## Responsive Behavior

### Desktop (lg and up)
- Shows 6-7 cards per view
- Navigation arrows visible and positioned outside carousel
- Full carousel controls

### Tablet (md)
- Shows 4-5 cards per view
- Navigation arrows visible
- Touch scrolling enabled

### Mobile (sm and below)
- Shows 2-3 cards per view
- Navigation arrows hidden
- Touch/swipe scrolling
- "Swipe to see more" hint displayed

## Dependencies

- **embla-carousel-react** (^8.6.0): Core carousel functionality
- **react-icons** (^5.7.0): Icon components
- **framer-motion** (^12.42.2): Smooth animations (optional)
- **@tanstack/react-query** (^5.101.2): Data fetching
- **zustand** (^5.0.14): Cart state management

## Backend Requirements

No backend changes required. The component works with existing product endpoints:
- `/products` - Standard product listing
- `/products?featured=true&limit=N` - Featured products
- `/products?limit=N&sort=price` - Price-sorted products

## Cart Integration

The compact cards integrate with the existing cart system:
- **Authenticated users:** Uses API cart endpoints
- **Guest users:** Uses Zustand store with localStorage
- **Toast notifications:** Success/error feedback
- **Cart count updates:** Automatic via React Query invalidation

## Performance Considerations

1. **Lazy Loading:** Images use `loading="lazy"` attribute
2. **Fixed Dimensions:** Prevents layout shift during load
3. **Optimized Queries:** Separate queries for different sections
4. **Carousel Virtualization:** Only visible cards are rendered
5. **Query Caching:** React Query handles caching automatically

## Accessibility

- **Keyboard Navigation:** Arrow buttons are keyboard accessible
- **ARIA Labels:** Buttons have descriptive labels
- **Focus Management:** Proper focus indicators
- **Screen Readers:** Semantic HTML structure
- **Color Contrast:** WCAG AA compliant text colors

## Future Enhancements

1. **Real Product Ratings:** Replace placeholder with actual rating data
2. **Wishlist Integration:** Add heart icon for wishlist
3. **Quick View:** Modal preview on hover/click
4. **Product Variants:** Show variant options on card
5. **Compare Products:** Multi-select for comparison
6. **Infinite Scroll:** Load more products dynamically
7. **Skeleton Loading:** Better loading states
8. **Animations:** Smooth card entrance/exit animations

## Testing Recommendations

1. **Responsive Testing:** Verify layout on all screen sizes
2. **Touch Gestures:** Test swipe/scroll on mobile devices
3. **Cart Integration:** Verify add-to-cart for auth/guest users
4. **Image Loading:** Test with missing/slow-loading images
5. **Long Text:** Test product names with varying lengths
6. **Edge Cases:** Zero products, single product, many products
7. **Browser Testing:** Cross-browser compatibility

## Maintenance Notes

- Keep card dimensions consistent across all carousels
- Maintain image aspect ratio handling
- Update rating display when backend supports it
- Monitor carousel performance with large datasets
- Keep dependency versions synchronized
