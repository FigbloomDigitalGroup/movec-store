# Compact Product Cards - Testing Guide

## Quick Start Testing

### 1. Start the Development Server

```bash
# In the frontend directory
npm run dev
```

The app should start on `http://localhost:5173` (or another port if 5173 is busy).

### 2. Navigate to Home Page

Open your browser and go to:
```
http://localhost:5173/
```

### 3. Locate Compact Card Sections

Scroll down the home page to find these sections with compact cards:
1. **"Recommended For You"** - Gray background, after Featured Brands
2. **"Offers you cannot miss"** - White background, after Recommended
3. **"Lowest Prices Everyday"** - Gray background, near the bottom

## Visual Verification Checklist

### Card Dimensions ✓
- [ ] All cards are exactly 180px wide
- [ ] Image containers are 160px tall
- [ ] Cards have consistent height
- [ ] 12px gap between cards
- [ ] White background with light gray border
- [ ] 8px border radius on cards

### Image Display ✓
- [ ] Images are centered in their container
- [ ] No cropping or stretching (object-fit: contain)
- [ ] 12px padding around images
- [ ] Images load with lazy loading
- [ ] Fallback icon shows if no image

### Typography ✓
- [ ] Product names truncate to 2 lines
- [ ] Ellipsis (...) shows for long names
- [ ] Brand names display in gray
- [ ] Prices are bold and clear
- [ ] Old prices have strikethrough
- [ ] Stock status is color-coded (green/red)

### Interactive Elements ✓
- [ ] Blue circular "+" button at bottom-right of image
- [ ] Button changes color on hover (darker blue)
- [ ] Discount badge shows at top-left (if applicable)
- [ ] Star rating displays below stock status
- [ ] Entire card is clickable (links to product page)
- [ ] Hover effect adds shadow to card

### Navigation ✓
- [ ] Left/right arrows visible on desktop
- [ ] Arrows positioned outside carousel
- [ ] Arrows hidden on mobile
- [ ] Arrows work (scroll left/right)
- [ ] Arrows disable when at start/end
- [ ] Touch scrolling works on mobile
- [ ] Smooth scrolling animation

## Functional Testing

### Add to Cart (Guest User)

1. **Click the "+" button** on any product card
2. **Expected Result:**
   - Toast notification: "Added [Product Name] to cart"
   - Cart count increases in navbar
   - Product added to localStorage

**Verify:**
```javascript
// Open browser console and run:
JSON.parse(localStorage.getItem('guestCart'))
// Should show array with your added product
```

### Add to Cart (Authenticated User)

1. **Login** to your account
2. **Click the "+" button** on any product card
3. **Expected Result:**
   - Toast notification: "Added [Product Name] to cart"
   - Cart count updates via API
   - Product persisted to database

**Test:**
- Add product
- Refresh page
- Check cart count still shows product

### Navigation to Product Detail

1. **Click anywhere on a product card** (except the "+" button)
2. **Expected Result:**
   - Navigate to `/products/[product-slug]`
   - Product detail page loads
   - Can navigate back

### Carousel Scrolling (Desktop)

1. **Click the right arrow** (►)
2. **Expected Result:**
   - Carousel scrolls to show next set of products
   - Smooth animation
   - Left arrow becomes enabled

3. **Click the left arrow** (◄)
4. **Expected Result:**
   - Carousel scrolls back
   - Shows previous products
   - Right arrow becomes enabled

### Carousel Scrolling (Mobile)

1. **Open in mobile view** (DevTools or real device)
2. **Swipe left** on the carousel
3. **Expected Result:**
   - Cards scroll horizontally
   - Smooth momentum scrolling
   - "Swipe to see more →" hint displays

### Responsive Breakpoints

Test at these viewport widths:

**Mobile (375px)**
- [ ] 2-3 cards visible
- [ ] No navigation arrows
- [ ] Touch scrolling enabled
- [ ] Swipe hint visible
- [ ] Card dimensions intact

**Tablet (768px)**
- [ ] 4-5 cards visible
- [ ] Navigation arrows visible
- [ ] Touch scrolling enabled
- [ ] Proper spacing maintained

**Desktop (1280px)**
- [ ] 6-7 cards visible
- [ ] Navigation arrows positioned outside
- [ ] Smooth hover effects
- [ ] All features functional

**Large Desktop (1920px)**
- [ ] 8-9 cards visible
- [ ] Layout doesn't break
- [ ] Arrows still functional
- [ ] Content centered

## Browser Testing

### Chrome/Edge
1. Open in Chrome or Edge
2. Test all features
3. Check console for errors
4. Verify animations smooth

### Firefox
1. Open in Firefox
2. Test all features
3. Check carousel performance
4. Verify image loading

### Safari (macOS)
1. Open in Safari
2. Test touch trackpad scrolling
3. Check smooth scrolling
4. Verify all interactions

### Safari (iOS)
1. Open on iPhone/iPad
2. Test touch scrolling
3. Check button tap targets (min 44px)
4. Verify layout doesn't break

### Chrome (Android)
1. Open on Android device
2. Test swipe gestures
3. Check performance
4. Verify responsive layout

## Performance Testing

### Page Load Speed

1. **Open DevTools Performance tab**
2. **Record page load**
3. **Check metrics:**
   - [ ] First Contentful Paint < 1.5s
   - [ ] Largest Contentful Paint < 2.5s
   - [ ] Time to Interactive < 3.5s

### Image Loading

1. **Throttle network** to "Fast 3G"
2. **Scroll to compact card section**
3. **Expected Result:**
   - Images load progressively
   - No layout shift
   - Lazy loading works
   - Placeholder space maintained

### Memory Usage

1. **Open DevTools Memory tab**
2. **Take heap snapshot**
3. **Scroll through carousels**
4. **Take another snapshot**
5. **Compare:**
   - [ ] No significant memory leaks
   - [ ] Reasonable memory increase
   - [ ] Detached DOM nodes minimal

## Accessibility Testing

### Keyboard Navigation

1. **Tab through the page**
2. **Expected behavior:**
   - [ ] Can focus on cards
   - [ ] Can focus on "+" buttons
   - [ ] Can focus on navigation arrows
   - [ ] Focus indicators visible
   - [ ] Tab order logical

3. **Test keyboard shortcuts:**
   - [ ] `Enter` - Opens product page
   - [ ] `Space` - Activates button
   - [ ] `Arrow Left` - Scrolls carousel left
   - [ ] `Arrow Right` - Scrolls carousel right

### Screen Reader Testing

1. **Enable screen reader** (NVDA/JAWS/VoiceOver)
2. **Navigate to carousel**
3. **Expected announcements:**
   - [ ] Section title announced
   - [ ] Product name announced
   - [ ] Price announced
   - [ ] Stock status announced
   - [ ] Button purpose clear ("Add to cart")
   - [ ] Navigation controls labeled

### Color Contrast

1. **Check text contrast:**
   - [ ] Product name (gray-900 on white) ✓
   - [ ] Brand (gray-500 on white) ✓
   - [ ] Price (gray-900 on white) ✓
   - [ ] Stock (green-600/red-500 on white) ✓
   - [ ] Button (white on blue-600) ✓

2. **Use contrast checker tool:**
   - All text should meet WCAG AA (4.5:1 minimum)

### Focus Management

1. **Click "Add to Cart" button**
2. **Check:**
   - [ ] Focus remains on button
   - [ ] Toast notification appears
   - [ ] No unexpected focus jumps

## Edge Cases Testing

### No Products

Test with empty product array:
```typescript
// In component
const products = [];
```

**Expected Result:**
- [ ] Section doesn't render
- [ ] No errors in console
- [ ] Graceful handling

### Single Product

Test with one product:
```typescript
const products = [singleProduct];
```

**Expected Result:**
- [ ] Single card displays
- [ ] No navigation arrows
- [ ] No scrolling possible
- [ ] Card looks correct

### Long Product Names

Test with very long product name:
```
"Super Ultra Mega Premium Advanced Professional Grade High-Quality Product Name That Is Really Really Long"
```

**Expected Result:**
- [ ] Name truncates to 2 lines
- [ ] Ellipsis (...) appears
- [ ] Card height consistent
- [ ] No overflow

### Missing Images

Test with product having no images:
```typescript
product.images = [];
```

**Expected Result:**
- [ ] Fallback icon displays (shopping cart)
- [ ] No broken image
- [ ] Card layout intact
- [ ] Add button still works

### Out of Stock

Test with out-of-stock product:
```typescript
product.stock = 0;
```

**Expected Result:**
- [ ] "Out of Stock" in red
- [ ] Red dot indicator
- [ ] Add to cart still enabled (or disabled if you prefer)

### No Discount

Test with product having no compareAtPrice:
```typescript
product.compareAtPrice = null;
```

**Expected Result:**
- [ ] No strikethrough price
- [ ] No discount badge
- [ ] Clean price display

### Network Error

Test with network failure:
1. Open DevTools Network tab
2. Set to "Offline"
3. Reload page

**Expected Result:**
- [ ] Error state shows
- [ ] Helpful error message
- [ ] Retry option available
- [ ] No white screen crash

## Integration Testing

### Cart Integration (Guest)

1. Add product to cart
2. Navigate to cart page
3. **Verify:**
   - [ ] Product appears in cart
   - [ ] Correct name, price, image
   - [ ] Quantity correct (1)
   - [ ] Can update quantity
   - [ ] Can remove product

### Cart Integration (Authenticated)

1. Login
2. Add product to cart
3. Logout and login again
4. **Verify:**
   - [ ] Cart persists
   - [ ] Products still there
   - [ ] Quantities correct

### Product Detail Link

1. Click on a compact card
2. **Verify:**
   - [ ] Correct product detail page opens
   - [ ] Same product info
   - [ ] Images match
   - [ ] Can add to cart from detail page
   - [ ] Back button works

### Multiple Sections

1. Add product from "Recommended For You"
2. Add product from "Offers you cannot miss"
3. Add product from "Lowest Prices Everyday"
4. **Verify:**
   - [ ] All three products in cart
   - [ ] Cart count = 3
   - [ ] Each has quantity 1

## Regression Testing

After any changes, verify:

### Core Functionality
- [ ] Add to cart still works
- [ ] Navigation still works
- [ ] Links still work
- [ ] Images still load
- [ ] Toast notifications appear

### Layout Integrity
- [ ] Card dimensions consistent
- [ ] Responsive layout intact
- [ ] No layout shifts
- [ ] Spacing correct

### Performance
- [ ] No new console errors
- [ ] No performance degradation
- [ ] Images load efficiently
- [ ] Smooth scrolling maintained

## Automated Testing (Future)

Consider adding these tests:

### Unit Tests
```typescript
// CompactProductCard.test.tsx
describe('CompactProductCard', () => {
  it('renders product name', () => {});
  it('displays price correctly', () => {});
  it('shows discount badge when applicable', () => {});
  it('calls add to cart on button click', () => {});
  it('navigates to product detail on card click', () => {});
});
```

### Integration Tests
```typescript
// ProductCarousel.test.tsx
describe('ProductCarousel', () => {
  it('renders multiple cards', () => {});
  it('scrolls on arrow click', () => {});
  it('disables arrows at boundaries', () => {});
  it('handles empty products array', () => {});
});
```

### E2E Tests (Playwright/Cypress)
```typescript
test('user can add product from carousel', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="add-to-cart-btn"]');
  await expect(page.locator('.cart-count')).toHaveText('1');
});
```

## Performance Benchmarks

### Target Metrics
- **Load Time:** < 2 seconds
- **FCP:** < 1.5 seconds
- **LCP:** < 2.5 seconds
- **CLS:** < 0.1
- **TTI:** < 3.5 seconds
- **Bundle Size:** < 50KB added

### Lighthouse Scores
Run Lighthouse audit and aim for:
- **Performance:** > 90
- **Accessibility:** > 95
- **Best Practices:** > 90
- **SEO:** > 90

## Bug Reporting Template

If you find a bug, report it with:

```markdown
### Bug Description
Clear description of the issue

### Steps to Reproduce
1. Go to home page
2. Scroll to "Recommended For You"
3. Click add to cart button
4. See error

### Expected Behavior
Should add product to cart and show toast

### Actual Behavior
Console error appears, cart doesn't update

### Environment
- Browser: Chrome 120
- OS: Windows 11
- Screen Size: 1920x1080
- Device: Desktop

### Screenshots
[Attach relevant screenshots]

### Console Errors
[Paste any console errors]

### Additional Context
Any other relevant information
```

## Common Issues & Solutions

### Issue: Cards have different heights
**Solution:** Check that image container has fixed 160px height

### Issue: Images are stretched
**Solution:** Verify `object-fit: contain` is applied

### Issue: Add to cart doesn't work
**Solution:** Check cart store initialization and API endpoints

### Issue: Arrows don't appear
**Solution:** Verify `embla-carousel-react` is installed and imported

### Issue: Touch scrolling doesn't work
**Solution:** Check Embla configuration includes `watchDrag: true`

### Issue: Products don't load
**Solution:** Check API endpoint and React Query configuration

## Testing Sign-off

Before marking complete, ensure:

- [ ] All visual checks pass
- [ ] All functional tests pass
- [ ] Tested on 3+ browsers
- [ ] Tested on mobile device
- [ ] Tested on tablet
- [ ] Accessibility verified
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Documentation reviewed
- [ ] Edge cases handled

## Next Steps

After testing is complete:
1. ✅ Fix any issues found
2. ✅ Re-test after fixes
3. ✅ Get stakeholder approval
4. ✅ Prepare for production deployment
5. ✅ Monitor analytics after launch
6. ✅ Gather user feedback
7. ✅ Plan enhancements based on data

---

**Happy Testing! 🚀**

For questions or issues, refer to:
- `COMPACT_PRODUCT_CARDS.md` - Full documentation
- `COMPACT_CARDS_VISUAL_GUIDE.md` - Design reference
- `IMPLEMENTATION_SUMMARY.md` - Technical details
