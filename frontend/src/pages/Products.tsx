import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import { FiSearch, FiFilter } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import ProductCard from '../components/ProductCard';
import SectionHero from '../components/ui/SectionHero';
import { useInfiniteScrollTrigger } from '../hooks/useInfiniteScrollTrigger';

const PRICE_RANGES = [
  { value: '', label: 'All Prices' },
  { value: '0-10000', label: 'Under KES 10,000' },
  { value: '10000-50000', label: 'KES 10,000 - 50,000' },
  { value: '50000-100000', label: 'KES 50,000 - 100,000' },
  { value: '100000-', label: 'Over KES 100,000' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    staleTime: 15 * 60 * 1000,
  });
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get('/brands').then((r) => r.data),
    staleTime: 15 * 60 * 1000,
  });

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const priceRangeValue = (() => {
    const min = searchParams.get('minPrice') || '';
    const max = searchParams.get('maxPrice') || '';
    if (!min && !max) return '';
    return `${min}-${max}`;
  })();

  const handlePriceRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (!value) {
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      const [min, max] = value.split('-');
      if (min) params.set('minPrice', min); else params.delete('minPrice');
      if (max) params.set('maxPrice', max); else params.delete('maxPrice');
    }
    setSearchParams(params);
  };

  const sortValue = (() => {
    const sortBy = searchParams.get('sortBy');
    const order = searchParams.get('order');
    if (sortBy === 'price' && order === 'asc') return 'price-asc';
    if (sortBy === 'price' && order === 'desc') return 'price-desc';
    return '';
  })();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (!value) {
      params.delete('sortBy');
      params.delete('order');
    } else {
      const [field, order] = value.split('-');
      params.set('sortBy', field);
      params.set('order', order);
    }
    setSearchParams(params);
  };

  const activeFilterCount = ['category', 'brand', 'minPrice', 'maxPrice', 'inStock'].filter((k) =>
    searchParams.get(k)
  ).length;

  const paramsWithoutPage = new URLSearchParams(searchParams);
  paramsWithoutPage.delete('page');
  const paramsKey = paramsWithoutPage.toString();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products-infinite', paramsKey],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams(searchParams);
      params.delete('page');
      params.set('page', String(pageParam));
      const { data } = await api.get(`/products?${params.toString()}`);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.meta;
      return page * limit < total ? page + 1 : undefined;
    },
  });

  const sentinelRef = useInfiniteScrollTrigger({
    onIntersect: () => {
      fetchNextPage();
    },
    enabled: !!hasNextPage && !isFetchingNextPage,
  });

  const products = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.meta.total;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search.trim()) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <SectionHero title="Products" subtitle="Browse our full catalog of Starlink and CCTV products" />

      <div className="w-full px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B982] focus:border-transparent"
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                Search
              </Button>
            </form>
            <Button
              variant="outline"
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2"
            >
              <FiFilter size={20} />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>

          {filterOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={searchParams.get('category') || ''}
                    onChange={(e) => setParam('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B982]"
                  >
                    <option value="">All Categories</option>
                    {(categories || []).map((c: any) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={priceRangeValue}
                    onChange={(e) => handlePriceRangeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B982]"
                  >
                    {PRICE_RANGES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    value={searchParams.get('brand') || ''}
                    onChange={(e) => setParam('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B982]"
                  >
                    <option value="">All Brands</option>
                    {(brands || []).map((b: any) => (
                      <option key={b.id} value={b.slug}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    value={searchParams.get('inStock') || ''}
                    onChange={(e) => setParam('inStock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B982]"
                  >
                    <option value="">All</option>
                    <option value="true">In Stock</option>
                  </select>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    ['category', 'brand', 'minPrice', 'maxPrice', 'inStock'].forEach((k) => params.delete(k));
                    params.delete('page');
                    setSearchParams(params);
                  }}
                  className="mt-3 text-xs font-semibold text-[#10B982] hover:text-[#0d9b6f]"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-700">
            {total !== undefined ? `${total} product${total === 1 ? '' : 's'} found` : 'Loading products...'}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Sort by:</span>
            <select
              value={sortValue}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B982]"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
        ) : total === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-16 text-center text-gray-500 shadow-sm">
            <FiSearch size={48} className="mx-auto mb-4" />
            <p className="text-lg font-semibold">No products match your search.</p>
            <p className="mt-2 text-sm text-gray-500">Try changing your search term, clearing filters, or browsing another category.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  ['search', 'category', 'brand', 'minPrice', 'maxPrice', 'inStock', 'sortBy', 'order'].forEach((k) => params.delete(k));
                  setSearch('');
                  setSearchParams(params);
                }}
                className="rounded-2xl border border-[#10B982]/30 bg-[#ecfdf5] px-5 py-3 text-sm font-semibold text-[#10B982] transition hover:bg-[#d9f8ee]"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Browse categories
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {hasNextPage && <div ref={sentinelRef} className="h-10" />}
        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#10B982]" />
          </div>
        )}
        {!hasNextPage && products.length > 0 && (
          <p className="text-center text-sm text-gray-500 py-8">You've reached the end of the catalog.</p>
        )}
      </div>
    </div>
  );
}