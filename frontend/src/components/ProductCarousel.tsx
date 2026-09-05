import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { Product } from '../types';
import CompactProductCard from './CompactProductCard';

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  viewAllLink?: string;
}

export default function ProductCarousel({ products, title, viewAllLink }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      slidesToScroll: 1,
      dragFree: false,
      // Embla's native `loop` clones slides to fake infinite scroll, which gets visibly
      // unstable (arrows flicker, position jumps) once the slides only marginally overflow
      // the viewport — the common case for a short curated row. Wraparound is handled
      // manually below instead, which stays stable at any slide count.
      loop: false,
    },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })],
  );

  const [canScroll, setCanScroll] = useState(false);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollPrev()) {
      emblaApi.scrollPrev();
    } else {
      emblaApi.scrollTo(emblaApi.scrollSnapList().length - 1);
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    } else {
      emblaApi.scrollTo(0);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onInit = () => setCanScroll(emblaApi.scrollSnapList().length > 1);

    emblaApi.on('reInit', onInit);
    onInit();

    return () => {
      emblaApi.off('reInit', onInit);
    };
  }, [emblaApi]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="text-sm text-[#10B982] hover:text-[#0d9b6f] font-medium hover:underline"
            >
              See All
            </a>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow - Desktop Only */}
        {canScroll && (
          <button
            onClick={scrollPrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 bg-white border border-gray-300 rounded-full items-center justify-center shadow-md hover:bg-gray-50 hover:border-gray-400 transition-all"
            aria-label="Previous products"
          >
            <FiChevronLeft size={20} className="text-gray-700" />
          </button>
        )}

        {/* Right Arrow - Desktop Only */}
        {canScroll && (
          <button
            onClick={scrollNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 bg-white border border-gray-300 rounded-full items-center justify-center shadow-md hover:bg-gray-50 hover:border-gray-400 transition-all"
            aria-label="Next products"
          >
            <FiChevronRight size={20} className="text-gray-700" />
          </button>
        )}

        {/* Embla Viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-2">
            {products.map((product) => (
              <div key={product.id} className="flex-[0_0_auto]">
                <CompactProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Scroll Hint */}
      {canScroll && (
        <div className="md:hidden text-center mt-3">
          <p className="text-xs text-gray-500">Swipe to see more →</p>
        </div>
      )}
    </div>
  );
}
