import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getModule, getModuleProducts } from '../lib/api';
import { FiSearch, FiArrowRight, FiGlobe, FiVideo, FiPackage } from 'react-icons/fi';
import SectionHero from '../components/ui/SectionHero';
import ProductCard from '../components/ProductCard';

interface StoreModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { products: number };
  categories?: { id: string; name: string; slug: string }[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
}

interface ModuleProductsResponse {
  module: StoreModule;
  data: Product[];
  meta: { page: number; limit: number; total: number };
}

const MODULE_THEMES: Record<string, { icon: any; title: string; description: string }> = {
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

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const selectedCategory = searchParams.get('category') || '';
  const pageNumber = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = Number.isNaN(pageNumber) ? 1 : pageNumber;

  const { data: mod, isLoading: isModuleLoading } = useQuery<StoreModule>({
    queryKey: ['module', moduleSlug],
    queryFn: () => getModule(moduleSlug!),
    enabled: !!moduleSlug,
  });

  const { data, isLoading: isProductsLoading } = useQuery<ModuleProductsResponse>({
    queryKey: ['module-products', moduleSlug, searchParams.toString()],
    queryFn: () => getModuleProducts(moduleSlug!, Object.fromEntries(searchParams)),
    enabled: !!moduleSlug,
  });

  const products: Product[] = data?.data || [];
  const totalPages = data?.meta ? Math.ceil(data.meta.total / data.meta.limit) : 1;

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

  return (
    <div className="min-h-screen">
      <SectionHero title={title} subtitle={subtitle}>
        <div className="mt-8 grid gap-4 lg:grid-cols-[auto_1fr] items-center">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B982]/10 text-[#10B982] text-2xl">
                {theme.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Module summary</p>
                <p className="text-sm text-gray-700">{mod?._count?.products ?? 0} products available</p>
                <p className="text-sm text-gray-700">{mod?.categories?.length ?? 0} categories</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-gray-600">
              <p>Focused product collection for {title} buyers.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-[#10B982] hover:text-[#0d9b6f]"
              >
                View all products <FiArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Search ${title} products...`}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-28 text-sm text-gray-900 outline-none transition focus:border-[#10B982] focus:bg-white"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl bg-[#10B982] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d9b6f]"
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
                  ? 'bg-[#10B982] text-white'
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
                    ? 'bg-[#10B982] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {(isModuleLoading || isProductsLoading) && (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
            Loading {isModuleLoading ? 'module details' : 'products'}...
          </div>
        )}

        {!isProductsLoading && products.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white p-16 text-center text-gray-500 shadow-sm">
            <FiSearch size={48} className="mx-auto mb-4" />
            <p className="text-lg font-semibold">No products found.</p>
            <p className="mt-2 text-sm text-gray-500">Try another search term or choose a different category.</p>
          </div>
        )}

        {!isProductsLoading && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}

        {!isProductsLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              disabled={currentPage <= 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                currentPage <= 2 ? params.delete('page') : params.set('page', String(currentPage - 1));
                setSearchParams(params);
              }}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(currentPage + 1));
                setSearchParams(params);
              }}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
