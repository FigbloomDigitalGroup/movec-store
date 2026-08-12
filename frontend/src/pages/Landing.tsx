import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { getModules } from '../lib/api';
import {
  FiPackage,
  FiArrowRight,
  FiWifi,
  FiCamera,
  FiShield,
  FiMapPin,
  FiSmartphone,
  FiTool,
  FiCheckCircle,
} from 'react-icons/fi';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import type { Product } from '../types';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  badgeColor: string | null;
  ctaText: string;
  ctaLink: string;
  imageUrl: string | null;
  product?: Product | null;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  sortOrder: number;
}

const BRAND_ORANGE = '#FC6501';

interface StoreModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count?: { products: number };
  categories?: { id: string; name: string; slug: string }[];
}

const MODULE_CONFIG: Record<string, { icon: React.ReactNode; gradient: string }> = {
  starlink: {
    icon: <FiWifi size={36} />,
    gradient: 'from-[#10B982] via-[#48c79d] to-[#f8a16b]',
  },
  cctv: {
    icon: <FiCamera size={36} />,
    gradient: 'from-[#10B982] via-[#34c38f] to-[#FC6501]',
  },
};

const DEFAULT_CONFIG = {
  icon: <FiPackage size={36} />,
  gradient: 'from-slate-700 to-slate-600',
};

const FALLBACK_MODULES: StoreModule[] = [
  {
    id: 'module-starlink',
    name: 'Starlink',
    slug: 'starlink',
    description:
      'High-speed satellite internet solutions powered by SpaceX Starlink. Kits, accessories, and mounts for home and mobile use.',
    imageUrl: null,
    _count: { products: 0 },
    categories: [
      { id: '1', name: 'Starlink Kits', slug: 'starlink-kits' },
      { id: '2', name: 'Starlink Accessories', slug: 'starlink-accessories' },
      { id: '3', name: 'Starlink Mounts', slug: 'starlink-mounts' },
    ],
  },
  {
    id: 'module-cctv',
    name: 'CCTV & Security',
    slug: 'cctv',
    description:
      'Professional CCTV cameras, DVRs, NVRs and surveillance accessories for homes and businesses.',
    imageUrl: null,
    _count: { products: 0 },
    categories: [
      { id: '4', name: 'IP Cameras', slug: 'ip-cameras' },
      { id: '5', name: 'DVR / NVR', slug: 'dvr-nvr' },
      { id: '6', name: 'Hard Drives', slug: 'surveillance-hard-drives' },
    ],
  },
];

function ModuleCard({ mod }: { mod: StoreModule }) {
  const config = MODULE_CONFIG[mod.slug] || DEFAULT_CONFIG;
  const productCount = mod._count?.products ?? 0;
  const categories = mod.categories ?? [];

  return (
    <Link to={`/solutions/${mod.slug}`} className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B982] focus-visible:ring-offset-2 rounded-xl">
      <Card hover className="h-full transition-shadow group-hover:border-[#10B982]/30 group-hover:shadow-[0_20px_40px_rgba(16,185,130,0.12)]">
        <CardBody className="flex h-full flex-col">
          <div className={`mb-6 rounded-2xl bg-gradient-to-br ${config.gradient} p-8 text-white shadow-lg`}>
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-white/20 p-4 backdrop-blur-sm">{config.icon}</div>
              {productCount > 0 && <Badge variant="gray" className="!bg-white/20 !text-white">{productCount} Products</Badge>}
            </div>
            <h2 className="mt-6 text-2xl font-bold md:text-3xl">{mod.name}</h2>
          </div>

          <p className="mb-6 flex-1 leading-relaxed text-slate-700">{mod.description}</p>

          {categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span key={cat.id} className="rounded-full bg-[#F3F5F2] px-3 py-1 text-xs text-slate-700">
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 font-semibold text-[#FC6501] transition-all group-hover:gap-3">
            Explore {mod.name}
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

const defaultBanners: PromoBanner[] = [
  {
    id: 'default-1',
    title: 'Stay online, anywhere in Kenya.',
    subtitle: 'Rooftop-ready satellite internet with speeds up to 220 Mbps. Get the best Starlink coverage for home, office, and remote sites.',
    badge: 'Starlink',
    badgeColor: BRAND_ORANGE,
    ctaText: 'Shop Starlink Kits',
    ctaLink: '/products?category=starlink',
    imageUrl: null,
    product: null,
    bgColor: '#F5FEF8',
    textColor: '#0F172A',
    isActive: true,
    sortOrder: 0,
  },
];

function isInternalLink(href: string) {
  return href.startsWith('/');
}

export default function Landing() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: banners = [] } = useQuery<PromoBanner[]>({
    queryKey: ['promo-banners'],
    queryFn: async () => {
      const { data } = await api.get('/promo-banners');
      return data as PromoBanner[];
    },
  });

  const { data: modules, isLoading: modulesLoading, isError: modulesError } = useQuery<StoreModule[]>(
    {
      queryKey: ['modules'],
      queryFn: getModules,
      retry: 1,
    }
  );

  const displayModules = modules && modules.length > 0 ? modules : FALLBACK_MODULES;
  const slides = banners.length > 0 ? banners : defaultBanners;
  const activeSlide = slides[activeIndex % slides.length] || slides[0];

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const hasProduct = Boolean(activeSlide.product);

  return (
    <div className="min-h-screen bg-[#F6F8F6] text-slate-900">
      <div className="bg-[#FC6501] text-white text-sm px-4 py-3 text-center font-medium shadow-sm">
        Free delivery on orders over KES 50,000 • Nationwide installation available
      </div>

      <section className="relative overflow-hidden pt-8">
        <div className="absolute inset-x-0 top-0 h-48 bg-[#10B982]/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-12 justify-items-center text-center lg:grid-cols-[1.05fr_0.95fr] lg:text-left">
            <div className="space-y-6 max-w-3xl lg:max-w-none">
              {activeSlide.badge && (
                <span
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em]"
                  style={{ backgroundColor: `${activeSlide.badgeColor || BRAND_ORANGE}1a`, color: activeSlide.badgeColor || BRAND_ORANGE }}
                >
                  {activeSlide.badge}
                </span>
              )}

              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{activeSlide.title}</h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                {activeSlide.subtitle ?? 'Find fast, reliable hardware and installation services for homes, offices, and retail spaces across Kenya.'}
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start">
                {isInternalLink(activeSlide.ctaLink) ? (
                  <Link
                    to={activeSlide.ctaLink}
                    className="inline-flex items-center justify-center rounded-full border border-[#10B982] bg-[#10B982] px-7 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(16,185,130,0.22)] transition hover:bg-[#0fa872] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#10B982] focus:ring-offset-2"
                    style={{
                      backgroundColor: activeSlide.badgeColor || '#10B982',
                      color: '#ffffff',
                    }}
                  >
                    {activeSlide.ctaText}
                  </Link>
                ) : (
                  <a
                    href={activeSlide.ctaLink}
                    className="inline-flex items-center justify-center rounded-full border border-[#10B982] bg-[#10B982] px-7 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(16,185,130,0.22)] transition hover:bg-[#0fa872] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#10B982] focus:ring-offset-2"
                    style={{
                      backgroundColor: activeSlide.badgeColor || '#10B982',
                      color: '#ffffff',
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {activeSlide.ctaText}
                  </a>
                )}

                <Link to="/shop" className="inline-flex items-center justify-center rounded-full border border-[#FC6501]/40 bg-[#fff8f4] px-6 py-4 text-base font-semibold text-slate-900 transition hover:border-[#FC6501] hover:bg-[#fff1ea] hover:text-[#0f172a]">
                  Browse products
                </Link>
              </div>

              {hasProduct && activeSlide.product && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Featured product</p>
                  <p className="mt-2 text-base font-semibold text-[#0F172A]">{activeSlide.product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">From KES {activeSlide.product.price.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-[36px] bg-white p-6 shadow-[0_40px_80px_rgba(16,185,130,0.12)] max-w-[520px] w-full">
              <div className="absolute -right-16 top-10 h-36 w-36 rounded-full bg-[#FC6501]/20 blur-3xl" />
              <div className="relative flex min-h-[360px] items-center justify-center">
                {activeSlide.imageUrl ? (
                  <img src={activeSlide.imageUrl} alt={activeSlide.title} className="h-[360px] w-full max-w-full object-contain" />
                ) : (
                  <div className="flex h-[360px] items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-[#F8FBF7] text-center text-slate-500">
                    <div>
                      <p className="text-xl font-semibold text-slate-900">Movec hero banner</p>
                      <p className="mt-2 text-sm text-slate-500">Upload an image from the admin banner editor to personalize this slide.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {slides.map((_, index) => (
              <button key={index} type="button" onClick={() => setActiveIndex(index)} className={`h-3 rounded-full transition-all ${index === activeIndex ? 'w-10 bg-[#FC6501]' : 'w-3 bg-slate-300 hover:bg-slate-400'}`} aria-label={`Show slide ${index + 1}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[#FC6501] font-semibold">Shop by solution</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Browse our main product lines</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
              Explore Starlink, CCTV, and networking solutions directly from the homepage. Each card opens the relevant product line so customers can shop faster.
            </p>
          </div>

          {modulesError && (
            <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
              Could not load the latest solution listings. Showing core product lines instead.
            </div>
          )}

          {modulesLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-[420px] animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {displayModules.map((mod) => (
                <ModuleCard key={mod.id} mod={mod} />
              ))}
            </div>
          )}

          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="text-slate-700">Want to browse the full catalog?</p>
            <Link to="/products" className="inline-flex items-center gap-2 rounded-full border border-[#FC6501]/40 bg-[#fff8f4] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#FC6501] hover:bg-[#fff1ea] hover:text-[#0f172a]">
              <FiPackage size={18} /> Browse All Products
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f7faf8] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#FC6501]">Why Choose Movec Systems?</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Next-generation connectivity and security, in one place.</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600">
              Because life is already busy enough without buffering videos, ghost alerts, or wondering if your signal is pretending to work.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {[
              {
                icon: FiWifi,
                title: 'Fast, Reliable Connectivity',
                text: 'High-speed Starlink internet with low latency for streaming, gaming, Zoom calls, and remote work — even where the usual providers tap out.',
                accent: 'from-[#ECFDF5] to-[#F0FDF4]',
              },
              {
                icon: FiShield,
                title: 'Smart, AI-Powered Security',
                text: 'Hikvision CCTV with human and vehicle detection, intrusion alerts, and sharp night vision — so you get the important alerts, not every passing shadow.',
                accent: 'from-[#F8FAFC] to-[#EEF6FF]',
              },
              {
                icon: FiMapPin,
                title: 'Coverage Everywhere',
                text: 'From homes and offices to farms, schools, hospitals, and remote sites — we keep the signal and the security strong wherever you are.',
                accent: 'from-[#FFF7ED] to-[#FFF1E9]',
              },
              {
                icon: FiSmartphone,
                title: 'Manage From Anywhere',
                text: 'View your internet status or camera footage from your phone, tablet, or laptop — because checking in should be easy, not a full mission.',
                accent: 'from-[#F3F4F6] to-[#EEF2FF]',
              },
              {
                icon: FiTool,
                title: 'Simple Setup, Real Support',
                text: 'Professional installation, setup help, warranty coverage, and after-sales support — genuine gear, smooth delivery, and zero “it should be working” energy.',
                accent: 'from-[#F5F3FF] to-[#F3E8FF]',
              },
            ].map(({ icon: Icon, title, text, accent }) => (
              <div key={title} className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${accent} p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]`}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#10B982] shadow-sm">
                  <Icon size={22} />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] md:p-8">
            <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#FC6501]">Perfect For</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">Homes, businesses, and every place that deserves solid internet and better security.</h3>
              </div>
              <div className="flex flex-wrap justify-center gap-2 md:justify-end">
                {['Homes', 'Businesses', 'Schools', 'Hospitals', 'Farms', 'Hotels & Lodges', 'Construction Sites', 'Retail Shops', 'Warehouses', 'Estates', 'Remote Communities'].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-[28px] bg-gradient-to-r from-[#0d9b6f] to-[#FC6501] p-6 text-white shadow-[0_22px_50px_rgba(16,185,130,0.18)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">Why Buy From Us</p>
                <h3 className="mt-3 text-2xl font-semibold">Because the best setups don’t come with drama.</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  'Genuine Starlink & Hikvision equipment',
                  'Professional installation',
                  'Nationwide delivery',
                  'Warranty support',
                  'Expert technical assistance',
                  'Competitive pricing',
                  '24/7 customer support',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-medium text-white/95 backdrop-blur-sm">
                    <FiCheckCircle className="flex-shrink-0 text-white" size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
