import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import {
  FiWifi,
  FiCamera,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiZap,
  FiPackage,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';

// Apple-style product tile component
function AppleProductTile({ product }: { product: Product }) {
  const images = product.images || [];
  const mainImage = images[0]?.url;

  return (
    <Link to={`/products/${product.slug}`} className="block group">
      <div className="mb-3">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <FiPackage size={32} className="text-gray-300" />
          </div>
        )}
      </div>
      <p className="text-sm text-gray-900 text-center font-medium group-hover:text-accent transition-colors">
        {product.name}
      </p>
    </Link>
  );
}

const WHATSAPP_NUMBER = '254796285718';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

interface Testimonial {
  name: string;
  location: string;
  product: string;
  rating: number;
  date: string;
  review: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'James K.',
    location: 'Nairobi',
    product: 'Starlink Standard Kit',
    rating: 5,
    date: 'June 2026',
    review: 'Excellent Starlink kit! Fast delivery and the installation support was top-notch.',
  },
  {
    name: 'Mary W.',
    location: 'Nakuru',
    product: 'Hikvision CCTV System',
    rating: 5,
    date: 'May 2026',
    review: 'The CCTV system works perfectly. Great night vision and clear footage.',
  },
  {
    name: 'Brian O.',
    location: 'Kisumu',
    product: 'Starlink Mini',
    rating: 5,
    date: 'July 2026',
    review: 'Professional service and genuine products. Highly recommend Movec Store!',
  },
];




export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?featured=true&limit=100');
      return data.data as Product[];
    },
  });

  const { data: bestSellers } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: async () => {
      const { data } = await api.get('/products?bestSeller=true&limit=100');
      return data.data as Product[];
    },
  });



  // Best Sellers carousel
  const [bestSellersRef, bestSellersApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    watchDrag: true,
    dragFree: true,
  });
  const scrollBestSellersPrev = useCallback(() => bestSellersApi?.scrollPrev(), [bestSellersApi]);
  const scrollBestSellersNext = useCallback(() => bestSellersApi?.scrollNext(), [bestSellersApi]);
  const [canScrollBestSellersPrev, setCanScrollBestSellersPrev] = useState(false);
  const [canScrollBestSellersNext, setCanScrollBestSellersNext] = useState(false);
  useEffect(() => {
    if (!bestSellersApi) return;
    const onSelect = () => {
      setCanScrollBestSellersPrev(bestSellersApi.canScrollPrev());
      setCanScrollBestSellersNext(bestSellersApi.canScrollNext());
    };
    bestSellersApi.on('select', onSelect);
    onSelect();
  }, [bestSellersApi]);

  // Featured Products carousel
  const [featuredRef, featuredApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    watchDrag: true,
    dragFree: true,
  });
  const scrollFeaturedPrev = useCallback(() => featuredApi?.scrollPrev(), [featuredApi]);
  const scrollFeaturedNext = useCallback(() => featuredApi?.scrollNext(), [featuredApi]);
  const [canScrollFeaturedPrev, setCanScrollFeaturedPrev] = useState(false);
  const [canScrollFeaturedNext, setCanScrollFeaturedNext] = useState(false);
  useEffect(() => {
    if (!featuredApi) return;
    const onSelect = () => {
      setCanScrollFeaturedPrev(featuredApi.canScrollPrev());
      setCanScrollFeaturedNext(featuredApi.canScrollNext());
    };
    featuredApi.on('select', onSelect);
    onSelect();
  }, [featuredApi]);

  // Testimonials carousel
  const [testimonialRef] = useEmblaCarousel(
    { loop: true, dragFree: true, align: 'start' },
    [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );



  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ══════════════════════════════════════
          APPLE-STYLE HERO SECTION
      ══════════════════════════════════════ */}
      <section className="bg-gray-50 border-b border-gray-200/50 py-16 md:py-24">
        <div className="w-full px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-16">
            
            {/* Left: Large, bold heading */}
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-none">
                Store
              </h1>
            </div>

            {/* Right: Supporting content with links */}
            <div className="flex-1 text-right space-y-3">
              <p className="text-lg text-gray-600 max-w-md ml-auto">
                The latest Starlink kits, CCTV systems, and networking gear — all in one place.
              </p>
              <div className="flex items-center justify-end gap-6">
                <Link
                  to="/products"
                  className="text-accent hover:text-accent-hover text-base font-medium flex items-center gap-1 transition"
                >
                  Shop all <span className="text-[#0071e3]">›</span>
                </Link>
                  <Link
                    to="/categories"
                    className="text-accent hover:text-accent-hover text-base font-medium flex items-center gap-1 transition"
                  >
                    Browse categories <span className="text-accent">›</span>
                  </Link>
              </div>
            </div>

          </div>
        </div>
      </section>





      {/* ══════════════════════════════════════
          APPLE-STYLE PRODUCT ROW: BEST SELLERS
      ══════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Best Sellers</h2>
            <Link
              to="/products"
              className="text-accent hover:text-accent-hover text-base font-medium flex items-center gap-1 transition"
            >
              See all <span className="text-accent">›</span>
            </Link>
          </div>

          <div className="relative">
            <div className="embla" ref={bestSellersRef}>
              <div className="embla__container flex gap-8 md:gap-12">
                {(bestSellers ?? Array(4).fill(null)).map((product, idx) =>
                  product ? (
                    <div key={product.id} className="embla__slide flex-[0_0_auto] min-w-0" style={{ width: '200px' }}>
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.07 }}
                        className="h-full"
                      >
                        <AppleProductTile product={product} />
                      </motion.div>
                    </div>
                  ) : (
                    <div key={idx} className="embla__slide flex-[0_0_auto] min-w-0" style={{ width: '200px' }}>
                      <div className="bg-gray-100 h-48 animate-pulse rounded-lg" />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={scrollBestSellersPrev}
              disabled={!canScrollBestSellersPrev}
              className="absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:text-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={scrollBestSellersNext}
              disabled={!canScrollBestSellersNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:text-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          APPLE-STYLE CATEGORY ROW
      ══════════════════════════════════════ */}
      <section className="py-12 bg-white">
        <div className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Shop by Category</h2>
            <Link
              to="/categories"
              className="text-[#0071e3] hover:text-[#0077ed] text-base font-medium flex items-center gap-1 transition"
            >
              See all <span className="text-[#0071e3]">›</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <Link to="/solutions/starlink" className="group block text-center">
              <div className="mb-3">
                <FiWifi className="mx-auto text-gray-400 group-hover:text-[#0071e3] transition-colors" size={32} />
              </div>
              <p className="text-sm text-gray-900 font-medium group-hover:text-[#0071e3] transition-colors">Starlink</p>
            </Link>

            <Link to="/solutions/cctv" className="group block text-center">
              <div className="mb-3">
                <FiCamera className="mx-auto text-gray-400 group-hover:text-[#0071e3] transition-colors" size={32} />
              </div>
              <p className="text-sm text-gray-900 font-medium group-hover:text-[#0071e3] transition-colors">CCTV</p>
            </Link>

            <Link to="/products?category=networking" className="group block text-center">
              <div className="mb-3">
                <FiZap className="mx-auto text-gray-400 group-hover:text-[#0071e3] transition-colors" size={32} />
              </div>
              <p className="text-sm text-gray-900 font-medium group-hover:text-[#0071e3] transition-colors">Networking</p>
            </Link>

            <Link to="/products?category=accessories" className="group block text-center">
              <div className="mb-3">
                <FiPackage className="mx-auto text-gray-400 group-hover:text-[#0071e3] transition-colors" size={32} />
              </div>
              <p className="text-sm text-gray-900 font-medium group-hover:text-[#0071e3] transition-colors">Accessories</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          APPLE-STYLE PRODUCT ROW: FEATURED
      ══════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="w-full px-4 md:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Featured</h2>
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-700 text-base font-medium flex items-center gap-1 transition"
              >
                See all <span className="text-blue-600">›</span>
              </Link>
            </div>

            <div className="relative">
              <div className="embla" ref={featuredRef}>
                <div className="embla__container flex gap-8 md:gap-12">
                  {featured.map((product, idx) => (
                    <div key={product.id} className="embla__slide flex-[0_0_auto] min-w-0" style={{ width: '200px' }}>
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.05 }}
                        className="h-full"
                      >
                        <AppleProductTile product={product} />
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation arrows */}
              <button
                onClick={scrollFeaturedPrev}
                disabled={!canScrollFeaturedPrev}
                className="absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#0071e3] hover:text-[#0071e3] transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={scrollFeaturedNext}
                disabled={!canScrollFeaturedNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#0071e3] hover:text-[#0071e3] transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}



      {/* ══════════════════════════════════════
          APPLE-STYLE TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Customer Stories</h2>
            <p className="text-gray-600">See what our customers have to say</p>
          </div>

          <div className="embla overflow-hidden" ref={testimonialRef}>
            <div className="embla__container flex -mx-2">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="embla__slide flex-[0_0_90%] sm:flex-[0_0_50%] md:flex-[0_0_33%] min-w-0 px-2 pb-2 cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                    className="bg-white p-6 rounded-lg h-full"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-semibold text-sm">{t.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                        <p className="text-gray-500 text-xs">{t.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <FiStar key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">"{t.review}"</p>
                    <p className="text-gray-500 text-xs">{t.product} · {t.date}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FLOATING WHATSAPP BUTTON
      ══════════════════════════════════════ */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#25d366] hover:bg-[#1ebe57] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label="Order via WhatsApp"
      >
        <FaWhatsapp size={26} />
      </a>

    </div>
  );
}
