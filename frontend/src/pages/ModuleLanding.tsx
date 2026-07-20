import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getModule, getModuleProducts } from '../lib/api';
import { FiSearch, FiFilter, FiArrowLeft, FiChevronRight, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

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

const MODULE_THEMES: Record<string, { gradient: string; banner: string; icon: string; pill: string; pillText: string }> = {
  starlink: {
    gradient: 'from-blue-900 via-indigo-900 to-purple-900',
    banner: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    icon: '🛰️',
    pill: 'bg-blue-500/20 border-blue-500/30',
    pillText: 'text-blue-300',
  },
  cctv: {
    gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
    banner: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    icon: '📹',
    pill: 'bg-emerald-500/20 border-emerald-500/30',
    pillText: 'text-emerald-300',
  },
};

const DEFAULT_THEME = {
  gradient: 'from-gray-900 via-slate-900 to-gray-900',
  banner: 'from-slate-500/20 to-transparent',
  icon: '📦',
  pill: 'bg-slate-500/20 border-slate-500/30',
  pillText: 'text-slate-300',
};

function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addItem);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const totalStock = product.inventory.reduce((s, i) => s + i.quantity, 0);
  const image = product.images?.[0];

  return (
    <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 flex flex-col">
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden">
        <div className="h-52 bg-gradient-to-br from-gray-800 to-gray-900 relative">
          {image ? (
            <img
              src={image.url}
              alt={image.alt || product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-5xl opacity-30">📦</div>
          )}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              SALE
            </span>
          )}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white/70 text-sm font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-gray-500 text-xs mb-1">{product.brand?.name}</p>
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2 hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-auto mb-4">
          <span className="text-xl font-bold text-white">KES {product.price.toLocaleString()}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-gray-500 text-sm line-through">KES {product.compareAtPrice.toLocaleString()}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addToCart({ productId: product.id, name: product.name, slug: product.slug, price: product.price, image: image?.url ?? null, quantity: 1 })}
            disabled={totalStock === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            <FiShoppingCart size={15} />
            Add to Cart
          </button>
          <button
            onClick={() => addToWishlist({ productId: product.id, name: product.name, slug: product.slug, price: product.price, image: image?.url ?? null })}
            className="p-2 border border-white/10 hover:border-white/30 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
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
  });

  const { data, isLoading: productsLoading } = useQuery({
    queryKey: ['module-products', moduleSlug, searchParams.toString()],
    queryFn: () => {
      const params: Record<string, string> = {};
      searchParams.forEach((v, k) => { params[k] = v; });
      return getModuleProducts(moduleSlug!, params);
    },
    enabled: !!moduleSlug,
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
    <div className="min-h-screen bg-gray-950">
      {/* Hero Banner */}
      <div className={`relative bg-gradient-to-br ${theme.gradient} border-b border-white/10 overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.banner}`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.04),_transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <Link to="/modules" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-6 transition-colors">
            <FiArrowLeft size={16} />
            All Solutions
          </Link>

          {modLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-white/10 rounded-xl w-64 mb-3" />
              <div className="h-4 bg-white/10 rounded-xl w-96" />
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

      <div className="max-w-7xl mx-auto px-4 py-8">
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
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${
              showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
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
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                !activeCategory
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
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat.slug
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
            <Link to={`/modules/${moduleSlug}`} className="hover:text-white transition">
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
            <div className="text-6xl mb-4 opacity-30">🔍</div>
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
    </div>
  );
}
