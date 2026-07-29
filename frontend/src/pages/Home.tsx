import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import {
  FiWifi,
  FiCamera,
  FiTool,
  FiArrowRight,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiMessageSquare,
  FiMonitor,
  FiZap,
  FiPackage,
} from 'react-icons/fi';
import { FaWhatsapp, FaBuilding } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';

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
  {
    name: 'Sarah M.',
    location: 'Mombasa',
    product: 'Starlink + CCTV Bundle',
    rating: 5,
    date: 'April 2026',
    review: 'Their team guided me to the right product for my home and installed it perfectly.',
  },
  {
    name: 'Kevin K.',
    location: 'Eldoret',
    product: 'Dahua CCTV System',
    rating: 4,
    date: 'June 2026',
    review: 'Solid system, excellent night vision. Great value for money and fast delivery.',
  },
];

const heroSlides = [
  {
    badge: 'PREMIUM CCTV SYSTEMS',
    badgeBg: 'bg-[#10b982]',
    title: 'STARLINK GEN 3 KIT',
    subtitle: 'High-speed internet anywhere\nfor homes, businesses & remote locations.',
    price: 'FROM KSH 65,000',
    cta: 'SHOP NOW',
    ctaLink: '/solutions/starlink',
    bg: 'from-gray-900 via-gray-800 to-gray-900',
    icon: <FiWifi size={110} className="text-white/20" />,
  },
  {
    badge: 'AI-POWERED',
    badgeBg: 'bg-[#fc6501]',
    title: 'CCTV SECURITY SYSTEMS',
    subtitle: 'Complete surveillance for homes,\nbusinesses & remote properties.',
    price: 'FROM KSH 18,500',
    cta: 'SHOP NOW',
    ctaLink: '/solutions/cctv',
    bg: 'from-gray-900 via-slate-800 to-gray-900',
    icon: <FiCamera size={110} className="text-white/20" />,
  },
  {
    badge: 'CERTIFIED TECHNICIANS',
    badgeBg: 'bg-[#10b982]',
    title: 'PROFESSIONAL INSTALLATION',
    subtitle: 'Fast, clean, guaranteed workmanship\nacross all 47 counties in Kenya.',
    price: 'FROM KSH 3,500',
    cta: 'BOOK NOW',
    ctaLink: '/installation',
    bg: 'from-gray-900 via-zinc-800 to-gray-900',
    icon: <FiTool size={110} className="text-white/20" />,
  },
];


const sidebarCategories = [
  { label: 'Starlink Kits', icon: <FiWifi size={16} />, to: '/solutions/starlink' },
  { label: 'Starlink Accessories', icon: <FiPackage size={16} />, to: '/products?category=starlink-accessories' },
  { label: 'CCTV Cameras', icon: <FiCamera size={16} />, to: '/solutions/cctv' },
  { label: 'NVRs & DVRs', icon: <FiMonitor size={16} />, to: '/products?category=nvr-dvr' },
  { label: 'Networking', icon: <FiZap size={16} />, to: '/products?category=networking' },
  { label: 'Mounting Kits', icon: <FiTool size={16} />, to: '/products?category=mounting' },
  { label: 'Solar Power', icon: <FiZap size={16} />, to: '/products?category=solar' },
  { label: 'Smart Home', icon: <FiMonitor size={16} />, to: '/products?category=smart-home' },
];

const brands = [
  { name: 'Starlink', color: 'text-gray-900' },
  { name: 'HIKVISION', color: 'text-red-600' },
  { name: 'dahua', color: 'text-blue-600' },
  { name: 'tp-link', color: 'text-green-600' },
  { name: 'UBIQUITI', color: 'text-blue-800' },
  { name: 'EZVIZ', color: 'text-purple-600' },
];

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?featured=true&limit=8');
      return data.data as Product[];
    },
  });

  const { data: bestSellers } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: async () => {
      const { data } = await api.get('/products?featured=true&limit=4');
      return data.data as Product[];
    },
  });

  // Hero carousel
  const [heroRef, heroApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4500, stopOnInteraction: true }),
  ]);
  const [heroIndex, setHeroIndex] = useState(0);
  const scrollPrev = useCallback(() => heroApi?.scrollPrev(), [heroApi]);
  const scrollNext = useCallback(() => heroApi?.scrollNext(), [heroApi]);
  useEffect(() => {
    if (!heroApi) return;
    heroApi.on('select', () => setHeroIndex(heroApi.selectedScrollSnap()));
  }, [heroApi]);

  // Best Sellers carousel
  const [bestSellersRef, bestSellersApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
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

  // Brands carousel
  const [brandsRef] = useEmblaCarousel(
    { loop: true, dragFree: true, align: 'start' },
    [Autoplay({ delay: 2500, stopOnInteraction: false })]
  );

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ══════════════════════════════════════
          HERO — Sidebar + Carousel
      ══════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-200 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">

            {/* Category Sidebar */}
            <aside className="hidden lg:block w-52 flex-shrink-0 border-r border-gray-200 bg-white">
              <ul className="py-2">
                {sidebarCategories.map((cat) => (
                  <li key={cat.label}>
                    <Link
                      to={cat.to}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#10b982] transition group"
                    >
                      <span className="text-gray-400 group-hover:text-[#10b982] transition">{cat.icon}</span>
                      {cat.label}
                    </Link>
                  </li>
                ))}
                <li className="px-4 pt-3 pb-2">
                  <Link
                    to="/categories"
                    className="flex items-center gap-1 text-[#10b982] text-sm font-semibold hover:underline"
                  >
                    <span className="text-lg">⊞</span> View All Categories
                  </Link>
                </li>
              </ul>
            </aside>

            {/* Hero Carousel */}
            <div className="flex-1 relative overflow-hidden" style={{ minHeight: 320 }}>
              <div className="embla overflow-hidden h-full" ref={heroRef}>
                <div className="embla__container flex h-full">
                  {heroSlides.map((slide, idx) => (
                    <div
                      key={idx}
                      className={`embla__slide flex-[0_0_100%] min-w-0 bg-gradient-to-r ${slide.bg} relative flex items-center px-8 md:px-14 py-10 md:py-16 overflow-hidden`}
                    >
                      {/* Background icon */}
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-100 pointer-events-none select-none">
                        {slide.icon}
                      </div>

                      <div className="relative z-10 max-w-md">
                        <span className={`inline-block ${slide.badgeBg} text-white text-xs font-bold px-3 py-1 rounded mb-4 tracking-wide uppercase`}>
                          {slide.badge}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                          {slide.title}
                        </h1>
                        <p className="text-gray-300 text-sm md:text-base mb-4 whitespace-pre-line leading-relaxed">
                          {slide.subtitle}
                        </p>
                        <p className="text-[#fc6501] text-2xl font-black mb-6">{slide.price}</p>
                        <Link
                          to={slide.ctaLink}
                          className="inline-block bg-white text-gray-900 font-bold px-8 py-3 rounded hover:bg-gray-100 transition text-sm tracking-wide"
                        >
                          {slide.cta}
                        </Link>
                        <div className="flex flex-wrap gap-4 mt-6 text-gray-400 text-xs">
                          <span className="flex items-center gap-1"><span className="text-[#10b982]">✓</span> Fast Delivery</span>
                          <span className="flex items-center gap-1"><span className="text-[#10b982]">✓</span> Genuine Products</span>
                          <span className="flex items-center gap-1"><span className="text-[#10b982]">✓</span> Expert Support</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prev/Next */}
              <button onClick={scrollPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition backdrop-blur-sm">
                <FiChevronLeft size={18} />
              </button>
              <button onClick={scrollNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition backdrop-blur-sm">
                <FiChevronRight size={18} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => heroApi?.scrollTo(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === heroIndex ? 'bg-[#fc6501] w-6' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SERVICE HIGHLIGHTS
      ══════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Installation */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#10b982] hover:shadow-sm transition group">
              <div className="w-12 h-12 bg-[#fc6501]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#fc6501]/20 transition">
                <FiTool className="text-[#fc6501]" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">
                  Professional Installation Services
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Expert installation by certified technicians
                </p>
                <Link to="/installation" className="inline-flex items-center gap-1 text-[#10b982] text-xs font-semibold mt-2 hover:underline">
                  Learn More <FiArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Business Solutions */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#10b982] hover:shadow-sm transition group">
              <div className="w-12 h-12 bg-[#10b982]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#10b982]/20 transition">
                <FaBuilding className="text-[#10b982]" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">
                  Business Solutions
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Custom solutions for offices, farms, schools & enterprises
                </p>
                <Link to="/solutions" className="inline-flex items-center gap-1 text-[#10b982] text-xs font-semibold mt-2 hover:underline">
                  Learn More <FiArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#25d366] hover:shadow-sm transition group">
              <div className="w-12 h-12 bg-[#25d366]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#25d366]/20 transition">
                <FaWhatsapp className="text-[#25d366]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">
                  Order via WhatsApp
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Chat with us now on WhatsApp to order
                </p>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#25d366] text-xs font-semibold mt-2 hover:underline"
                >
                  Chat Now <FiArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED BRANDS
      ══════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
            Featured Brands
          </h2>
          <div className="embla overflow-hidden" ref={brandsRef}>
            <div className="embla__container flex items-center">
              {[...brands, ...brands].map((brand, i) => (
                <div
                  key={i}
                  className="embla__slide flex-[0_0_auto] min-w-0 px-8 flex items-center justify-center"
                >
                  <span className={`text-xl font-black tracking-tight ${brand.color} opacity-70 hover:opacity-100 transition cursor-default select-none`}>
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BEST SELLERS + HELP SIDEBAR
      ══════════════════════════════════════ */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-1 h-6 bg-[#fc6501] rounded-full inline-block" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Best Sellers</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={scrollBestSellersPrev}
                  disabled={!canScrollBestSellersPrev}
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#10b982] hover:text-[#10b982] hover:bg-[#10b982]/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  onClick={scrollBestSellersNext}
                  disabled={!canScrollBestSellersNext}
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#10b982] hover:text-[#10b982] hover:bg-[#10b982]/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
              <Link to="/products" className="text-[#10b982] text-sm font-semibold hover:underline flex items-center gap-1">
                View All <FiArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Products Carousel */}
            <div className="lg:col-span-4 relative overflow-hidden">
              <div className="embla" ref={bestSellersRef}>
                <div className="embla__container flex gap-4">
                  {(bestSellers ?? Array(4).fill(null)).map((product, idx) =>
                    product ? (
                      <div key={product.id} className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_50%] min-w-0">
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: idx * 0.07 }}
                          className="h-full"
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      </div>
                    ) : (
                      <div key={idx} className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_50%] min-w-0">
                        <div className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="lg:col-span-1">
              <div className="bg-[#10b982] rounded-xl p-6 text-white h-full flex flex-col justify-between min-h-[260px]">
                <div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <FiMessageSquare size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 leading-snug">Need Help Choosing?</h3>
                  <p className="text-white/80 text-sm mb-4">Our experts are ready to help you.</p>
                  <ul className="space-y-1.5 text-sm text-white/90">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> Product Advice</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> Installation Support</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> After Sales Support</li>
                  </ul>
                </div>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 bg-white text-[#10b982] font-bold text-sm py-2.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <FaWhatsapp size={18} />
                  Chat With Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORY SHOP CARDS
      ══════════════════════════════════════ */}
      <section className="py-10 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <Link to="/solutions/starlink" className="group bg-gray-50 hover:bg-[#10b982]/5 border border-gray-200 hover:border-[#10b982] rounded-xl p-5 transition flex flex-col justify-between min-h-[130px]">
              <div>
                <FiWifi className="text-[#10b982] mb-2" size={26} />
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#10b982] transition">Starlink Deals</h3>
                <p className="text-gray-500 text-xs mt-1">High-speed internet anywhere</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[#10b982] text-xs font-semibold mt-3 group-hover:underline">
                Shop Now <FiArrowRight size={12} />
              </span>
            </Link>

            <Link to="/solutions/cctv" className="group bg-gray-50 hover:bg-[#10b982]/5 border border-gray-200 hover:border-[#10b982] rounded-xl p-5 transition flex flex-col justify-between min-h-[130px]">
              <div>
                <FiCamera className="text-[#fc6501] mb-2" size={26} />
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#10b982] transition">CCTV Bundles</h3>
                <p className="text-gray-500 text-xs mt-1">Complete security systems</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[#10b982] text-xs font-semibold mt-3 group-hover:underline">
                Shop Now <FiArrowRight size={12} />
              </span>
            </Link>

            <Link to="/products?category=accessories" className="group bg-gray-50 hover:bg-[#10b982]/5 border border-gray-200 hover:border-[#10b982] rounded-xl p-5 transition flex flex-col justify-between min-h-[130px]">
              <div>
                <FiPackage className="text-[#10b982] mb-2" size={26} />
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#10b982] transition">Accessories</h3>
                <p className="text-gray-500 text-xs mt-1">Cables, mounts, adapters & more</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[#10b982] text-xs font-semibold mt-3 group-hover:underline">
                Shop Now <FiArrowRight size={12} />
              </span>
            </Link>

            <Link to="/products?category=networking" className="group bg-gray-50 hover:bg-[#10b982]/5 border border-gray-200 hover:border-[#10b982] rounded-xl p-5 transition flex flex-col justify-between min-h-[130px]">
              <div>
                <FiZap className="text-[#fc6501] mb-2" size={26} />
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#10b982] transition">Networking</h3>
                <p className="text-gray-500 text-xs mt-1">Routers, switches & access points</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[#10b982] text-xs font-semibold mt-3 group-hover:underline">
                Shop Now <FiArrowRight size={12} />
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED PRODUCTS (if any)
      ══════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 bg-[#10b982] rounded-full inline-block" />
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Featured Products</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={scrollFeaturedPrev}
                    disabled={!canScrollFeaturedPrev}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#10b982] hover:text-[#10b982] hover:bg-[#10b982]/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  <button
                    onClick={scrollFeaturedNext}
                    disabled={!canScrollFeaturedNext}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#10b982] hover:text-[#10b982] hover:bg-[#10b982]/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
                <Link to="/products" className="text-[#10b982] text-sm font-semibold hover:underline flex items-center gap-1">
                  View All <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <div className="embla" ref={featuredRef}>
                <div className="embla__container flex gap-4">
                  {featured.slice(0, 10).map((product, idx) => (
                    <div key={product.id} className="embla__slide flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_20%] min-w-0">
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.05 }}
                        className="h-full"
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-6 mt-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-0.5 text-yellow-400 mb-0.5">
                  {[1,2,3,4,5].map(s => <FiStar key={s} className="fill-yellow-400" size={14} />)}
                </div>
                <p className="text-lg font-bold text-gray-900">4.9</p>
                <p className="text-xs text-gray-500">Average Rating</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-lg font-bold text-gray-900">500+</p>
                <p className="text-xs text-gray-500">Installations</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-lg font-bold text-gray-900">98%</p>
                <p className="text-xs text-gray-500">Satisfaction Rate</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <p className="text-lg font-bold text-gray-900">47</p>
                <p className="text-xs text-gray-500">Counties Served</p>
              </div>
            </div>
          </div>

          <div className="embla overflow-hidden" ref={testimonialRef}>
            <div className="embla__container flex -mx-2">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="embla__slide flex-[0_0_90%] sm:flex-[0_0_50%] md:flex-[0_0_45%] lg:flex-[0_0_25%] min-w-0 px-2 pb-2 cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition h-full"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#10b982]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#10b982] font-bold text-sm">{t.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                        <p className="text-gray-400 text-xs">{t.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <FiStar key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed mb-3">"{t.review}"</p>
                    <p className="text-gray-400 text-xs">{t.product} · {t.date}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#fc6501]' : 'bg-gray-300'}`} />
            ))}
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
