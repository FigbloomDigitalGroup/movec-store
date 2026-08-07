# Home Page Updates - Full Width & Dynamic Banners

## Changes Needed in `frontend/src/pages/Home.tsx`

### 1. Add PromoBanner Interface (after Testimonial interface)

```typescript
interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  badgeColor: string | null;
  ctaText: string;
  ctaLink: string;
  imageUrl: string | null;
  productId: string | null;
  bgColor: string;
  textColor: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
  } | null;
}
```

### 2. Add Promo Banners Query (after existing queries)

```typescript
// Fetch promo banners from API
const { data: promoBanners, isLoading: bannersLoading } = useQuery({
  queryKey: ['promo-banners'],
  queryFn: async () => {
    const { data } = await api.get('/promo-banners');
    return data as PromoBanner[];
  },
});

// Use promoBanners if available, fallback to hardcoded heroSlides
const activeBanners = promoBanners && promoBanners.length > 0 ? promoBanners : heroSlides;
```

### 3. Remove ALL `max-w-7xl` Classes

Replace every occurrence of:
```typescript
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
```

With:
```typescript
className="w-full px-0"
```

**OR** for sections that need some padding:
```typescript
className="w-full px-4 sm:px-6 lg:px-8"
```

### 4. Update Hero Carousel to Use Dynamic Banners

Replace the hero carousel mapping from:
```typescript
{heroSlides.map((slide, idx) => (
```

To:
```typescript
{activeBanners.map((banner, idx) => {
  // Check if it's a PromoBanner or heroSlide
  const isPromoBanner = 'product' in banner;
  
  return (
```

Then update the banner rendering to handle both types:

```typescript
<div
  key={isPromoBanner ? banner.id : idx}
  className="embla__slide flex-[0_0_100%] min-w-0 relative flex items-center overflow-hidden"
  style={{ backgroundColor: isPromoBanner ? banner.bgColor : undefined }}
  className={!isPromoBanner ? `embla__slide flex-[0_0_100%] min-w-0 ${banner.bg} relative flex items-center overflow-hidden` : undefined}
>
  {/* Image */}
  <div className="absolute right-0 top-0 bottom-0 w-3/5 flex items-center justify-center pointer-events-none select-none">
    <img
      src={isPromoBanner ? (banner.imageUrl || '') : banner.imageUrl}
      alt={banner.title}
      className="h-full w-full object-cover object-center"
    />
    <div 
      className="absolute inset-0"
      style={{
        background: isPromoBanner 
          ? `linear-gradient(to right, ${banner.bgColor} 0%, ${banner.bgColor}e6 15%, ${banner.bgColor}99 30%, ${banner.bgColor}4d 50%, ${banner.bgColor}1a 70%, transparent 100%)`
          : `linear-gradient(to right, ${banner.gradientFrom} 0%, ${banner.gradientFrom}e6 15%, ${banner.gradientFrom}99 30%, ${banner.gradientFrom}4d 50%, ${banner.gradientFrom}1a 70%, transparent 100%)`
      }}
    />
  </div>

  <div className="relative z-10 px-8 md:px-14 py-12 md:py-16 max-w-xl">
    {/* Badge */}
    {banner.badge && (
      <span 
        className="inline-block text-white text-[10px] font-bold px-3 py-1.5 rounded mb-4 tracking-wider uppercase"
        style={{ 
          backgroundColor: isPromoBanner ? (banner.badgeColor || '#10b982') : undefined 
        }}
        className={!isPromoBanner ? `inline-block ${banner.badgeBg} text-white text-[10px] font-bold px-3 py-1.5 rounded mb-4 tracking-wider uppercase` : undefined}
      >
        {banner.badge}
      </span>
    )}

    {/* Title */}
    <h1 
      className="text-3xl md:text-5xl font-black leading-tight mb-4"
      style={{ color: isPromoBanner ? banner.textColor : '#ffffff' }}
    >
      {banner.title}
    </h1>

    {/* Subtitle */}
    {banner.subtitle && (
      <p 
        className="text-sm md:text-base mb-6 whitespace-pre-line leading-relaxed max-w-md"
        style={{ color: isPromoBanner ? banner.textColor : '#d1d5db', opacity: 0.9 }}
      >
        {banner.subtitle}
      </p>
    )}

    {/* Price - Dynamic from product OR static */}
    <div className="mb-6">
      {isPromoBanner && banner.product ? (
        <>
          <p className="text-xs font-semibold tracking-wide uppercase mb-1 opacity-80" style={{ color: banner.textColor }}>
            FROM
          </p>
          <p className="text-3xl md:text-4xl font-black text-[#10b982]">
            KES {banner.product.price.toLocaleString()}
          </p>
          {banner.product.compareAtPrice && (
            <p className="text-sm opacity-60 line-through mt-1" style={{ color: banner.textColor }}>
              KES {banner.product.compareAtPrice.toLocaleString()}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-white text-xs font-semibold tracking-wide uppercase mb-1">
            {banner.price || 'FROM'}
          </p>
          <p className="text-[#10b982] text-3xl md:text-4xl font-black">
            {banner.priceAmount || ''}
          </p>
        </>
      )}
    </div>

    {/* CTA */}
    <Link
      to={isPromoBanner ? banner.ctaLink : banner.ctaLink}
      className="inline-flex items-center gap-2 bg-[#10b982] hover:bg-[#0ca072] text-white font-bold px-8 py-3.5 rounded-lg transition text-sm tracking-wide shadow-lg"
    >
      {isPromoBanner ? banner.ctaText : banner.cta}
      <FiArrowRight size={16} />
    </Link>
  </div>
</div>
```

### 5. Update Dots to Use activeBanners

Replace:
```typescript
{heroSlides.map((_, i) => (
```

With:
```typescript
{activeBanners.map((_, i) => (
```

## Quick Replace Commands

### Remove max-w-7xl (Find and Replace All)

**Find:**
```
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

**Replace with:**
```
w-full px-0
```

Then manually add padding back to sections that need it:
- Service highlights (keep px-4)
- Category cards (keep px-4)
- Testimonials (keep px-4)
- Footer (keep px-4)

## Testing Checklist

After making changes:

- [ ] Page loads without errors
- [ ] Banners fetch from API successfully
- [ ] Falls back to heroSlides if API fails
- [ ] Product prices show dynamically when linked
- [ ] Content goes edge-to-edge (no white space)
- [ ] Carousel navigation works
- [ ] Dots indicator works
- [ ] Responsive on mobile
- [ ] Service highlights section looks good
- [ ] All sections properly aligned

## Rollback Plan

If dynamic banners cause issues:

1. Keep the full-width changes (remove max-w-7xl)
2. Remove the promo-banners query
3. Keep using heroSlides as before

## Notes

- The full-width change is independent of dynamic banners
- Both can be implemented separately if needed
- Consider adding a loading skeleton for banners
- Add error boundary for banner API failures
