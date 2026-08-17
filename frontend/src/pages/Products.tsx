import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import { FiSearch, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import ProductCard from '../components/ProductCard';
import SectionHero from '../components/ui/SectionHero';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterOpen, setFilterOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products', searchParams.toString()],
    queryFn: async () => {
      const { data } = await api.get(`/products?${searchParams.toString()}`);
      return data;
    },
  });

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

  const currentPage = parseInt(searchParams.get('page') || '1');
  const totalPages = data?.meta ? Math.ceil(data.meta.total / data.meta.limit) : 1;

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
              Filters
            </Button>
          </div>

          {filterOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B982]">
                    <option>All Categories</option>
                    <option>Starlink</option>
                    <option>CCTV</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B982]">
                    <option>All Prices</option>
                    <option>Under KES 10,000</option>
                    <option>KES 10,000 - 50,000</option>
                    <option>KES 50,000 - 100,000</option>
                    <option>Over KES 100,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B982]">
                    <option>All Brands</option>
                    <option>Starlink</option>
                    <option>Hikvision</option>
                    <option>Dahua</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B982]">
                    <option>All</option>
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-700">
            {data?.meta ? `${data.meta.total} product${data.meta.total === 1 ? '' : 's'} found` : 'Loading products...'}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Sort by:</span>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B982]">
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
              <option>Best Selling</option>
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
        ) : data?.meta?.total === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-16 text-center text-gray-500 shadow-sm">
            <FiSearch size={48} className="mx-auto mb-4" />
            <p className="text-lg font-semibold">No products match your search.</p>
            <p className="mt-2 text-sm text-gray-500">Try changing your search term, clearing filters, or browsing another category.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('search');
                  params.delete('category');
                  params.delete('brand');
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
            {data?.data?.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.meta && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => {
                const page = currentPage - 1;
                const params = new URLSearchParams(searchParams);
                if (page <= 1) params.delete('page'); else params.set('page', String(page));
                setSearchParams(params);
              }}
            >
              <FiChevronLeft className="mr-2" size={16} />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      if (pageNum === 1) params.delete('page'); else params.set('page', String(pageNum));
                      setSearchParams(params);
                    }}
                    className={`w-10 h-10 rounded-lg font-medium transition ${
                      isCurrentPage
                        ? 'bg-[#10B982] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => {
                const page = currentPage + 1;
                const params = new URLSearchParams(searchParams);
                params.set('page', String(page));
                setSearchParams(params);
              }}
            >
              Next
              <FiChevronRight className="ml-2" size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}