import { useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getModule, getModuleProducts } from '../lib/api';
import { FiSearch, FiArrowRight, FiGlobe, FiVideo, FiPackage } from 'react-icons/fi';
import SectionHero from '../components/ui/SectionHero';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/ui/Skeleton';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useInfiniteScrollTrigger } from '../hooks/useInfiniteScrollTrigger';
import NotFound from './NotFound';
import type { Product } from '../types';

interface StoreModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { products: number };
  categories?: { id: string; name: string; slug: string }[];
}

interface ModuleProductsResponse {
  module: StoreModule;
  data: Product[];
  meta: { page: number; limit: number; total: number };
}

const MODULE_THEMES: Record<string, { icon: ReactNode; title: string; description: string }> = {
  starlink: { icon: <FiGlobe />, title: 'Starlink', description: 'High-speed satellite internet' },
  cctv: { icon: <FiVideo />, title: 'CCTV', description: 'AI-powered security systems' },
};

export default function ModuleLanding() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const theme = MODULE_THEMES[moduleSlug || ''] || {
    icon: <FiPackage />,
    title: 'Solutions',
    description: 'Browse our products',
  };

  // Keep the search box in sync whenever the URL's `search` param changes from
  // outside this input (back/forward navigation, a category pill reset, etc.),
  // without wiping out what the user is actively typing on every render.
  // Adjusting state during render — rather than in an effect — avoids the
  // extra render pass a useEffect-based sync would cause.
  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);
  if (searchParams !== prevSearchParams) {
    setPrevSearchParams(searchParams);
    setSearch(searchParams.get('search') || '');
  }

  const selectedCategory = searchParams.get('category') || '';

  const { data: mod, isLoading: isModuleLoading, isError: isModuleError } = useQuery<StoreModule>({
    queryKey: ['module', moduleSlug],
    queryFn: () => getModule(moduleSlug!),
    enabled: !!moduleSlug,
    retry: false,
  });

  const paramsWithoutPage = Object.fromEntries(searchParams);
  delete paramsWithoutPage.page;

  const {
    data,
    isLoading: isProductsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ModuleProductsResponse>({
    queryKey: ['module-products-infinite', moduleSlug, JSON.stringify(paramsWithoutPage)],
    queryFn: async ({ pageParam }) => {
      const params = Object.fromEntries(searchParams);
      delete params.page;
      return getModuleProducts(moduleSlug!, { ...params, page: String(pageParam) });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.meta;
      return page * limit < total ? page + 1 : undefined;
    },
    enabled: !!moduleSlug,
  });

  const products: Product[] = data?.pages.flatMap((p) => p.data) ?? [];

  const sentinelRef = useInfiniteScrollTrigger({
    onIntersect: () => fetchNextPage(),
    enabled: !!hasNextPage && !isFetchingNextPage,
  });

  const title = mod?.name || theme.title;
  const subtitle = mod?.description || theme.description;

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (search.trim()) params.set('search', search.trim());
    else params.delete('search');
    params.delete('page');
    setSearchParams(params);
  };

  const handleCategoryChange = (slug?: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug);
    else params.delete('category');
    params.delete('page');
    setSearchParams(params);
  };

  // A bare single-segment URL (e.g. /whatever-typo) falls through to this page
  // rather than the router's own NotFound, since module slugs are dynamic. Once
  // the lookup genuinely fails, show the same NotFound the router uses elsewhere
  // instead of rendering an empty "Solutions" shell.
  if (isModuleError) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 py-4">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />
        </div>
      </div>

      <SectionHero title={title} subtitle={subtitle}>
        <div className="mt-8 grid gap-4 lg:grid-cols-[auto_1fr] items-center">
          <div className="rounded-3xl border border-secondary-200 bg-secondary-50 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-500/10 text-secondary-500 text-2xl">
                {theme.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-secondary-700">Module summary</p>
                {isModuleLoading ? (
                  <>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-700">{mod?._count?.products ?? 0} products available</p>
                    <p className="text-sm text-gray-700">{mod?.categories?.length ?? 0} categories</p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-gray-600">
              <p>Focused product collection for {title} buyers.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-700"
              >
                View all products <FiArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Search ${title} products...`}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-28 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </SectionHero>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {mod?.categories && mod.categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange()}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === ''
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All categories
            </button>
            {mod.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.slug)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === category.slug
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {(isModuleLoading || isProductsLoading) && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <Skeleton className="h-[120px] w-full" />
                <div className="p-2">
                  <Skeleton className="h-3 w-12 mb-1.5" />
                  <Skeleton className="h-3 w-full mb-1.5" />
                  <Skeleton className="h-3 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isProductsLoading && products.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center text-gray-500 shadow-sm">
            <FiSearch size={48} className="mx-auto mb-4" />
            <p className="text-lg font-semibold">No products found.</p>
            <p className="mt-2 text-sm text-gray-500">Try another search term or choose a different category.</p>
          </div>
        )}

        {!isProductsLoading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {hasNextPage && (
          <div ref={sentinelRef} className="h-10" />
        )}
        {isFetchingNextPage && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
            Loading more products...
          </div>
        )}
        {!hasNextPage && products.length > 0 && (
          <p className="text-center text-sm text-gray-500 py-8">You've reached the end.</p>
        )}
      </div>
    </div>
  );
}
