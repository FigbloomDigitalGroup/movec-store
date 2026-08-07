import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getModule, getModuleProducts } from '../lib/api';
import { FiSearch, FiFilter, FiArrowLeft, FiChevronLeft, FiChevronRight, FiShoppingCart, FiShoppingBag, FiHeart, FiTarget, FiUser, FiAlertTriangle, FiPackage, FiSmile, FiSmartphone, FiMoon, FiCheck, FiArrowRight, FiShield, FiVideo, FiHome, FiActivity, FiMap, FiGlobe, FiZap, FiWifi, FiTool, FiMonitor, FiHelpCircle, FiLock, FiTruck, FiPhone, FiStar, FiMessageSquare, FiBox, FiMonitor as FiBuilding, FiBookOpen as FiBook, FiSun, FiCloud, FiPlay, FiMonitor as FiLaptop, FiUpload, FiDownload, FiUsers, FiLink, FiArrowUp } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import AnimatedContent from '../components/AnimatedContent';
import type { ReactElement } from 'react';

interface StoreModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  categories: { id: string; name: string; slug: string }[];
  _count: { products: number };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string; alt?: string }[];
  brand?: { name: string };
  categories: { id: string; name: string; slug: string }[];
  inventory: { quantity: number }[];
}

const MODULE_THEMES: Record<string, { gradient: string; banner: string; icon: ReactElement; pill: string; pillText: string }> = {
  starlink: {
    gradient: 'from-[#FC6501] via-[#FC6501] to-[#10B982]',

    banner: 'from-[#FC6501]/20 via-[#10B982]/10 to-transparent',

    icon: <FiGlobe />,

    pill: 'bg-[#FC6501]/20 border-[#FC6501]/30',

    pillText: 'text-[#FC6501]',
  },
  cctv: {
    gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
    banner: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    icon: <FiVideo />,
    pill: 'bg-emerald-500/20 border-emerald-500/30',
    pillText: 'text-emerald-300',
  },
};

const DEFAULT_THEME = {
  gradient: 'from-gray-900 via-slate-900 to-gray-900',
  banner: 'from-slate-500/20 to-transparent',
  icon: <FiPackage />,
  pill: 'bg-slate-500/20 border-slate-500/30',
  pillText: 'text-slate-300',
};

function ProductCard({ product }: { product: Product }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = product.images || [];
  const addToCart = useCartStore((s) => s.addItem);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const totalStock = product.inventory.reduce((s, i) => s + i.quantity, 0);

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div
      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col hover:border-gray-300 hover:-translate-y-2 hover:shadow-xl"
      style={{ transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden">
        <div className="h-52 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          {images.length > 0 ? (
            <img
              src={images[currentIndex]?.url}
              alt={images[currentIndex]?.alt || product.name}
              className="h-full w-full object-cover group-hover:scale-108"
              style={{ transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 opacity-30">
              <FiPackage size={48} />
            </div>
          )}
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 rounded-full p-1.5 shadow-md hover:bg-white hover:scale-110 transition-all z-10"
                aria-label="Previous image"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 rounded-full p-1.5 shadow-md hover:bg-white hover:scale-110 transition-all z-10"
                aria-label="Next image"
              >
                <FiChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentIndex(i);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
              {/* Image counter */}
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
          
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
              SALE
            </span>
          )}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <span className="text-white/70 text-sm font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-gray-500 text-xs mb-1">{product.brand?.name}</p>
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-gray-900 font-semibold text-sm line-clamp-2 mb-2 hover:text-blue-600 transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-auto mb-4">
          <span className="text-xl font-bold text-gray-900">KES {product.price.toLocaleString()}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-gray-400 text-sm line-through">KES {product.compareAtPrice.toLocaleString()}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addToCart({ productId: product.id, name: product.name, slug: product.slug, price: product.price, image: images[currentIndex]?.url ?? null, quantity: 1 })}
            disabled={totalStock === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            <FiShoppingCart size={15} />
            Add to Cart
          </button>
          <button
            onClick={() => addToWishlist({ productId: product.id, name: product.name, slug: product.slug, price: product.price, image: images[currentIndex]?.url ?? null })}
            className="p-2 border border-gray-200 hover:border-gray-300 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
          >
            <FiHeart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModuleLanding() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  const theme = MODULE_THEMES[moduleSlug || ''] || DEFAULT_THEME;

  const { data: mod, isLoading: modLoading } = useQuery<StoreModule>({
    queryKey: ['module', moduleSlug],
    queryFn: () => getModule(moduleSlug!),
    enabled: !!moduleSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data, isLoading: productsLoading } = useQuery({
    queryKey: ['module-products', moduleSlug, searchParams.toString()],
    queryFn: () => {
      const params: Record<string, string> = {};
      searchParams.forEach((v, k) => { params[k] = v; });
      return getModuleProducts(moduleSlug!, params);
    },
    enabled: !!moduleSlug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const activeCategory = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = data?.meta ? Math.ceil(data.meta.total / data.meta.limit) : 1;

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (search) params.set('search', search); else params.delete('search');
    params.delete('page');
    setSearchParams(params);
  };

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug); else params.delete('category');
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className={`relative bg-gradient-to-br ${theme.gradient} border-b border-white/10 overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.banner}`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.04),_transparent_60%)]" />

        <div className="relative w-full px-4 py-16">
          <Link to="/solutions" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-6 transition-colors">
            <FiArrowLeft size={16} />
            All Solutions
          </Link>

          {modLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-white/10 rounded-xl w-64 mb-3" />
              <div className="h-4 bg-white/10 rounded-xl w-96" />
            </div>
          ) : moduleSlug === 'starlink' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <FiGlobe className="text-orange-300" />
                  <span className="text-orange-100 text-sm font-medium">Satellite Internet</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
                  Connect Anywhere with Starlink
                </h1>
                <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                  High-Speed Internet, Wherever You Are. Experience next-generation satellite internet designed for homes, businesses, farms, schools, and remote locations. Stay connected with fast, reliable internet even where traditional fiber or mobile networks aren't available.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-orange-50 transition">
                    Shop Starlink Kits
                    <FiArrowRight />
                  </button>
                  <Link to="/installation" className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition">
                    Book Installation
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <FiGlobe className="text-white/80" size={120} />
                  </div>
                  <div className="absolute -top-4 -right-4 bg-orange-400 rounded-2xl p-4 shadow-xl">
                    <FiZap className="text-white" size={32} />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-green-400 rounded-2xl p-4 shadow-xl">
                    <FiWifi className="text-white" size={32} />
                  </div>
                </div>
              </div>
            </div>
          ) : moduleSlug === 'cctv' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <FiVideo className="text-cyan-300" />
                  <span className="text-cyan-100 text-sm font-medium">AI-Powered Security</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
                  AI-Powered Security
                  <br />
                  <span className="text-cyan-300">with OpenCV</span>
                </h1>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Smarter surveillance. Faster response. Better protection. Modern CCTV systems with computer vision technologies analyze video in real time, detect important events, and help you respond before incidents escalate.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition">
                    Shop CCTV Systems
                    <FiArrowRight />
                  </button>
                  <Link to="/installation" className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition">
                    Book Installation
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <FiShield className="text-white/80" size={120} />
                  </div>
                  <div className="absolute -top-4 -right-4 bg-cyan-400 rounded-2xl p-4 shadow-xl">
                    <FiSmile className="text-white" size={32} />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-blue-400 rounded-2xl p-4 shadow-xl">
                    <FiTarget className="text-white" size={32} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-5">
              <div className="text-5xl">{theme.icon}</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">{mod?.name}</h1>
                <p className="text-white/60 text-lg max-w-2xl">{mod?.description}</p>
                <p className="text-white/40 text-sm mt-2">{data?.meta?.total ?? 0} products</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CCTV-specific marketing sections */}
      {moduleSlug === 'cctv' && (
        <>
          {/* Product Grid */}
          <div id="products-grid" className="w-full px-4 py-8 bg-white">
            {/* Search + filter toggle */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder={`Search ${mod?.name ?? ''} products...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <FiFilter size={15} />
                Filters
              </button>
            </div>

            {/* Category filter pills */}
            {showFilters && mod?.categories && mod.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <button
                  onClick={() => setCategory('')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${!activeCategory
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    }`}
                >
                  All
                </button>
                {mod.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeCategory === cat.slug
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Breadcrumbs for active filter */}
            {(activeCategory || searchParams.get('search')) && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to={`/solutions/${moduleSlug}`} className="hover:text-blue-600 transition">
                  {mod?.name}
                </Link>
                {activeCategory && (
                  <>
                    <FiChevronRight size={12} />
                    <span className="text-gray-700 capitalize">{activeCategory.replace(/-/g, ' ')}</span>
                  </>
                )}
                {searchParams.get('search') && (
                  <>
                    <FiChevronRight size={12} />
                    <span className="text-gray-700">"{searchParams.get('search')}"</span>
                  </>
                )}
              </div>
            )}

            {/* Product grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-gray-100 h-80 animate-pulse" />
                ))}
              </div>
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-24 text-gray-500">
                <div className="text-6xl mb-4 opacity-30 flex justify-center">
                  <FiSearch size={48} />
                </div>
                <p className="text-lg">No products found.</p>
                <button onClick={() => { setSearch(''); setSearchParams({}); }} className="mt-4 text-blue-600 hover:underline text-sm">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {(data?.data || []).map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    page <= 2 ? params.delete('page') : params.set('page', String(page - 1));
                    setSearchParams(params);
                  }}
                  className="px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                >
                  Previous
                </button>
                <span className="text-gray-500 text-sm">
                  Page <span className="text-gray-900 font-medium">{page}</span> of <span className="text-gray-900 font-medium">{totalPages}</span>
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(page + 1));
                    setSearchParams(params);
                  }}
                  className="px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Key Benefits */}
          <section className="py-20 bg-gray-50">
            <div className="w-full px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Benefits</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Advanced AI features that take your security to the next level
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: FiTarget,
                    title: 'Intelligent Motion Detection',
                    description: 'Receive alerts only when meaningful movement is detected, reducing false alarms caused by wind, rain, or lighting changes.',
                    color: 'blue'
                  },
                  {
                    icon: FiUser,
                    title: 'Human & Vehicle Detection',
                    description: 'Differentiate between people, vehicles, and other moving objects to improve monitoring accuracy.',
                    color: 'green'
                  },
                  {
                    icon: FiAlertTriangle,
                    title: 'Intrusion Detection',
                    description: 'Automatically detect unauthorized entry into restricted areas and receive instant notifications.',
                    color: 'red'
                  },
                  {
                    icon: FiPackage,
                    title: 'Object Detection',
                    description: 'Monitor valuable assets and receive alerts when objects are removed, left behind, or moved unexpectedly.',
                    color: 'purple'
                  },
                  {
                    icon: FiMap,
                    title: 'License Plate Recognition',
                    description: 'Capture and identify vehicle registration numbers for homes, businesses, parking lots, and gated communities.',
                    color: 'orange'
                  },
                  {
                    icon: FiSmile,
                    title: 'Face Recognition',
                    description: 'Identify authorized personnel or recognize familiar faces for enhanced access control (Supported Models).',
                    color: 'pink'
                  },
                  {
                    icon: FiSmartphone,
                    title: 'Remote Monitoring',
                    description: 'View live footage and recorded videos securely from anywhere using your smartphone, tablet, or computer.',
                    color: 'cyan'
                  },
                  {
                    icon: FiMoon,
                    title: 'Crystal Clear Night Vision',
                    description: 'Advanced infrared technology delivers reliable surveillance even in complete darkness.',
                    color: 'indigo'
                  }
                ].map((benefit, index) => (
                  <AnimatedContent key={index} distance={30} direction="vertical" duration={0.6} delay={index * 0.05}>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 h-full">
                      <div className={`w-12 h-12 bg-${benefit.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                        <benefit.icon className={`text-${benefit.color}-600`} size={24} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">{benefit.title}</h3>
                      <p className="text-gray-700 text-sm">{benefit.description}</p>
                    </div>
                  </AnimatedContent>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Our CCTV Solutions */}
          <section className="py-20 bg-white">
            <div className="w-full px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Our CCTV Solutions?</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Premium quality with cutting-edge technology
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  'High-definition video quality (2MP, 4MP, 5MP & 4K)',
                  'AI-powered detection features',
                  'Weatherproof outdoor cameras (IP66/IP67)',
                  'Reliable 24/7 monitoring',
                  'Mobile app access',
                  'Easy installation and setup',
                  'Expandable systems for homes and businesses',
                  'Professional after-sales support'
                ].map((feature, index) => (
                  <AnimatedContent key={index} distance={20} direction="horizontal" reverse={false} duration={0.5} delay={index * 0.05}>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiCheck className="text-green-600" size={16} />
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  </AnimatedContent>
                ))}
              </div>
            </div>
          </section>

          {/* Perfect For */}
          <section className="py-20 bg-gray-50">
            <div className="w-full px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Perfect For</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Versatile security solutions for every environment
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { icon: <FiHome />, name: 'Homes' },
                  { icon: <FiBuilding />, name: 'Offices' },
                  { icon: <FiShoppingBag />, name: 'Retail Shops' },
                  { icon: <FiBook />, name: 'Schools' },
                  { icon: <FiActivity />, name: 'Hospitals' },
                  { icon: <FiTool />, name: 'Warehouses' },
                  { icon: <FiMap />, name: 'Parking Lots' },
                  { icon: <FiShield />, name: 'Hotels' },
                  { icon: <FiHome />, name: 'Churches' },
                  { icon: <FiHome />, name: 'Estates' }
                ].map((place, index) => (
                  <AnimatedContent key={index} distance={30} direction="vertical" duration={0.5} delay={index * 0.05}>
                    <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="text-blue-600 mx-auto mb-3 text-3xl flex justify-center">{place.icon}</div>
                      <span className="text-gray-700 font-medium">{place.name}</span>
                    </div>
                  </AnimatedContent>
                ))}
              </div>
            </div>
          </section>

          {/* Smart Features Table */}
          <section className="py-20 bg-white">
            <div className="w-full px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Smart Features Available</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Compare features and their benefits
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Feature</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900">Benefit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { feature: 'AI Motion Detection', benefit: 'Reduces unnecessary alerts' },
                      { feature: 'Human Detection', benefit: 'Detects people more accurately' },
                      { feature: 'Vehicle Detection', benefit: 'Identifies vehicles separately' },
                      { feature: 'Face Recognition*', benefit: 'Enhanced access management' },
                      { feature: 'License Plate Recognition*', benefit: 'Vehicle identification' },
                      { feature: 'Night Vision', benefit: '24/7 surveillance' },
                      { feature: 'Mobile Notifications', benefit: 'Instant alerts' },
                      { feature: 'Remote Viewing', benefit: 'Monitor from anywhere' },
                      { feature: 'Two-Way Audio*', benefit: 'Communicate through the camera' },
                      { feature: 'Smart Tracking*', benefit: 'Camera follows moving objects' }
                    ].map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 font-medium">{item.feature}</td>
                        <td className="px-6 py-4 text-gray-700">{item.benefit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600">
                  *Available on selected models
                </div>
              </div>
            </div>
          </section>

          {/* Why Buy From Us */}
          <section className="py-20 bg-gray-50">
            <div className="w-full px-4">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Buy From Us?</h2>
                  <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                    Your trusted partner for security solutions
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    'Genuine CCTV products',
                    'Competitive pricing',
                    'Fast nationwide delivery',
                    'Professional installation services',
                    'Warranty included',
                    'Expert technical support',
                    'Secure payment options',
                    '24/7 customer support'
                  ].map((reason, index) => (
                    <AnimatedContent key={index} distance={20} direction="horizontal" duration={0.5} delay={index * 0.05}>
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 h-full">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <FiCheck className="text-blue-600" size={16} />
                        </div>
                        <span className="font-medium">{reason}</span>
                      </div>
                    </AnimatedContent>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition">
                    Browse CCTV Products
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Upgrade Your Security?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Get AI-powered CCTV systems with professional installation. Protect what matters most.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition">
                  Shop CCTV Systems
                  <FiArrowRight />
                </button>
                <Link to="/installation" className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition">
                  Book Installation
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Starlink-specific marketing sections */}
      {moduleSlug === 'starlink' && (
        <>
          {/* Product Grid */}
          <div id="products-grid" className="w-full px-4 py-8 bg-white">
            {/* Search + filter toggle */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder={`Search ${mod?.name ?? ''} products...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <FiFilter size={15} />
                Filters
              </button>
            </div>

            {/* Category filter pills */}
            {showFilters && mod?.categories && mod.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <button
                  onClick={() => setCategory('')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${!activeCategory
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    }`}
                >
                  All
                </button>
                {mod.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeCategory === cat.slug
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Breadcrumbs for active filter */}
            {(activeCategory || searchParams.get('search')) && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to={`/solutions/${moduleSlug}`} className="hover:text-blue-600 transition">
                  {mod?.name}
                </Link>
                {activeCategory && (
                  <>
                    <FiChevronRight size={12} />
                    <span className="text-gray-700 capitalize">{activeCategory.replace(/-/g, ' ')}</span>
                  </>
                )}
                {searchParams.get('search') && (
                  <>
                    <FiChevronRight size={12} />
                    <span className="text-gray-700">"{searchParams.get('search')}"</span>
                  </>
                )}
              </div>
            )}

            {/* Product grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-gray-100 h-80 animate-pulse" />
                ))}
              </div>
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-24 text-gray-500">
                <div className="text-6xl mb-4 opacity-30 flex justify-center">
                  <FiSearch size={48} />
                </div>
                <p className="text-lg">No products found.</p>
                <button onClick={() => { setSearch(''); setSearchParams({}); }} className="mt-4 text-blue-600 hover:underline text-sm">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {(data?.data || []).map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    page <= 2 ? params.delete('page') : params.set('page', String(page - 1));
                    setSearchParams(params);
                  }}
                  className="px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                >
                  Previous
                </button>
                <span className="text-gray-500 text-sm">
                  Page <span className="text-gray-900 font-medium">{page}</span> of <span className="text-gray-900 font-medium">{totalPages}</span>
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(page + 1));
                    setSearchParams(params);
                  }}
                  className="px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Why Choose Starlink */}
          <section className="py-20 bg-gray-50">
            <div className="w-full px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Starlink?</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Next-generation satellite internet designed for everyone
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <FiArrowUp />,
                    title: 'High-Speed Performance',
                    description: 'Enjoy fast download and upload speeds for streaming, gaming, video conferencing, and everyday browsing.'
                  },
                  {
                    icon: <FiGlobe />,
                    title: 'Coverage in Remote Areas',
                    description: 'Get connected in rural and underserved locations where other internet options may be limited or unavailable.'
                  },
                  {
                    icon: <FiZap />,
                    title: 'Low Latency',
                    description: 'Designed to deliver responsive internet suitable for video calls, online gaming, and cloud-based work.'
                  },
                  {
                    icon: <FiWifi />,
                    title: 'Reliable Connectivity',
                    description: 'Access the internet through a network of low Earth orbit (LEO) satellites, helping provide consistent performance.'
                  },
                  {
                    icon: <FiHome />,
                    title: 'Simple Installation',
                    description: 'The Starlink kit is designed for straightforward setup, and professional installation services are available if needed.'
                  },
                  {
                    icon: <FiSmartphone />,
                    title: 'Manage from Anywhere',
                    description: 'Monitor your connection, check performance, and manage your network through the Starlink mobile app.'
                  }
                ].map((feature, index) => (
                  <AnimatedContent key={index} distance={30} direction="vertical" duration={0.6} delay={index * 0.05}>
                    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 h-full">
                      <div className="text-4xl mb-4 block text-orange-500">{feature.icon}</div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">{feature.title}</h3>
                      <p className="text-gray-700 text-sm">{feature.description}</p>
                    </div>
                  </AnimatedContent>
                ))}
              </div>
            </div>
          </section>

          {/* Perfect For */}
          <section className="py-20 bg-white">
            <div className="w-full px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Perfect For</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Versatile connectivity solutions for every environment
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { icon: <FiHome />, name: 'Homes' },
                  { icon: <FiBuilding />, name: 'Businesses' },
                  { icon: <FiBook />, name: 'Schools' },
                  { icon: <FiActivity />, name: 'Hospitals' },
                  { icon: <FiMap />, name: 'Farms' },
                  { icon: <FiSun />, name: 'Campsites' },
                  { icon: <FiTool />, name: 'Construction Sites' },
                  { icon: <FiShield />, name: 'Hotels & Lodges' },
                  { icon: <FiTruck />, name: 'Mobile Offices' },
                  { icon: <FiGlobe />, name: 'Remote Communities' }
                ].map((place, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <div className="text-4xl mb-3 block text-orange-500">{place.icon}</div>
                    <span className="text-gray-700 font-medium">{place.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What Can You Do */}
          <section className="py-20 bg-gray-50">
            <div className="w-full px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Can You Do?</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Unlock possibilities with high-speed satellite internet
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { icon: <FiPlay />, name: 'Stream HD & 4K videos' },
                  { icon: <FiPlay />, name: 'Play online games' },
                  { icon: <FiLaptop />, name: 'Work remotely' },
                  { icon: <FiVideo />, name: 'Attend Zoom or Teams meetings' },
                  { icon: <FiCloud />, name: 'Access cloud applications' },
                  { icon: <FiBook />, name: 'Learn online' },
                  { icon: <FiMonitor />, name: 'Watch live TV' },
                  { icon: <FiUpload />, name: 'Upload large files' },
                  { icon: <FiDownload />, name: 'Download large files' },
                  { icon: <FiUsers />, name: 'Connect multiple devices' }
                ].map((activity, index) => (
                  <AnimatedContent key={index} distance={20} direction="vertical" duration={0.5} delay={index * 0.05}>
                    <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full">
                      <div className="text-4xl mb-3 flex justify-center text-orange-500">{activity.icon}</div>
                      <span className="text-gray-700 font-medium text-sm">{activity.name}</span>
                    </div>
                  </AnimatedContent>
                ))}
              </div>
            </div>
          </section>

          {/* What's Included */}
          <section className="py-20 bg-white">
            <div className="w-full px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What's Included</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  Everything you need to get started
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <p className="text-gray-600 mb-6 text-center">Depending on the package, your Starlink kit may include:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { icon: <FiWifi />, name: 'Starlink Satellite Dish' },
                    { icon: <FiWifi />, name: 'Wi-Fi Router' },
                    { icon: <FiZap />, name: 'Power Supply' },
                    { icon: <FiLink />, name: 'Cables' },
                    { icon: <FiTool />, name: 'Mounting Hardware' },
                    { icon: <FiBook />, name: 'Setup Guide' }
                  ].map((item, index) => (
                    <AnimatedContent key={index} distance={20} direction="vertical" duration={0.5} delay={index * 0.05}>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 h-full">
                        <div className="text-3xl mb-2 flex justify-center text-orange-500">{item.icon}</div>
                        <span className="text-gray-700 font-medium text-xs">{item.name}</span>
                      </div>
                    </AnimatedContent>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why Buy From Us */}
          <section className="py-20 bg-gray-50">
            <div className="w-full px-4">
              <div className="bg-gradient-to-br from-orange-500 to-green-600 rounded-3xl p-8 md:p-12 text-white">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Buy From Us?</h2>
                  <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                    Your trusted partner for Starlink solutions
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    'Genuine Starlink equipment',
                    'Professional installation',
                    'Network setup and configuration',
                    'Nationwide delivery',
                    'Warranty support',
                    'Expert technical assistance',
                    'After-sales support',
                    'Competitive pricing'
                  ].map((reason, index) => (
                    <AnimatedContent key={index} distance={20} direction="horizontal" duration={0.5} delay={index * 0.05}>
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 h-full">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <FiCheck className="text-orange-500" size={16} />
                        </div>
                        <span className="font-medium">{reason}</span>
                      </div>
                    </AnimatedContent>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-xl text-gray-700">
                  Common questions about Starlink
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    question: 'Do I need fiber?',
                    answer: 'No. Starlink connects via satellites, so it doesn\'t require fiber or fixed-line infrastructure.'
                  },
                  {
                    question: 'Can I use it in rural areas?',
                    answer: 'Yes. Starlink is designed to provide internet access in areas where traditional broadband is limited.'
                  },
                  {
                    question: 'Can multiple devices connect?',
                    answer: 'Yes. The included Wi-Fi router supports multiple connected devices.'
                  },
                  {
                    question: 'Is it suitable for business?',
                    answer: 'Yes. Many businesses use Starlink for reliable connectivity, especially in remote or hard-to-reach locations.'
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 flex items-center gap-2">
                      <FiHelpCircle className="text-orange-500" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Connected Without Limits</h2>
              <p className="text-xl text-gray-300 mb-8">
                Bring high-speed satellite internet to your home or business. Browse our range of genuine Starlink equipment, accessories, and installation services to find the solution that fits your needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-orange-600 transition">
                  Shop Starlink Kits
                  <FiArrowRight />
                </button>
                <Link to="/installation" className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition">
                  Book Installation
                </Link>
              </div>
            </div>
          </section>

          {/* Trust Signals */}
          <section className="py-16 bg-gray-50">
            <div className="w-full px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: FiLock, text: 'Secure Payments' },
                  { icon: FiTruck, text: 'Fast Delivery Across Kenya' },
                  { icon: FiTool, text: 'Professional Installation' },
                  { icon: FiPhone, text: 'Dedicated Customer Support' },
                  { icon: FiStar, text: 'Genuine Products' },
                  { icon: FiShield, text: 'Warranty Included' },
                  { icon: FiMessageSquare, text: 'Expert Consultation' },
                  { icon: FiBox, text: 'Ready-to-Ship Stock' }
                ].map((signal, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <signal.icon className="text-orange-500" size={24} />
                    <span className="text-gray-700 font-medium text-sm">{signal.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Product grid for other modules (not CCTV or Starlink) */}
      {moduleSlug !== 'cctv' && moduleSlug !== 'starlink' && (
        <div id="products-grid" className="w-full px-4 py-8">
          {/* Search + filter toggle */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder={`Search ${mod?.name ?? ''} products...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
            >
              <FiFilter size={15} />
              Filters
            </button>
          </div>

          {/* Category filter pills */}
          {showFilters && mod?.categories && mod.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <button
                onClick={() => setCategory('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${!activeCategory
                  ? `${theme.pill} ${theme.pillText} border-current`
                  : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
              >
                All
              </button>
              {mod.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeCategory === cat.slug
                    ? `${theme.pill} ${theme.pillText} border-current`
                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Breadcrumbs for active filter */}
          {(activeCategory || searchParams.get('search')) && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to={`/solutions/${moduleSlug}`} className="hover:text-white transition">
                {mod?.name}
              </Link>
              {activeCategory && (
                <>
                  <FiChevronRight size={12} />
                  <span className="text-white/70 capitalize">{activeCategory.replace(/-/g, ' ')}</span>
                </>
              )}
              {searchParams.get('search') && (
                <>
                  <FiChevronRight size={12} />
                  <span className="text-white/70">"{searchParams.get('search')}"</span>
                </>
              )}
            </div>
          )}

          {/* Product grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/5 h-80 animate-pulse" />
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-24 text-gray-500">
              <div className="text-6xl mb-4 opacity-30 flex justify-center">
                <FiSearch size={48} />
              </div>
              <p className="text-lg">No products found.</p>
              <button onClick={() => { setSearch(''); setSearchParams({}); }} className="mt-4 text-blue-400 hover:underline text-sm">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(data?.data || []).map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  page <= 2 ? params.delete('page') : params.set('page', String(page - 1));
                  setSearchParams(params);
                }}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', String(page + 1));
                  setSearchParams(params);
                }}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
