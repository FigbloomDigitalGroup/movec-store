import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import { FiSearch, FiChevronLeft, FiChevronRight, FiFilter, FiSliders } from 'react-icons/fi';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

function ProductImageCarousel({ product }: { product: Product }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = product.images || [];

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
    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-64 rounded-t-xl overflow-hidden group">
      {images.length > 0 ? (
        <img
          src={images[currentIndex]?.url}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-400">
          <FiSliders size={48} />
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
          >
            <FiChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-700">Browse our full catalog of Starlink and CCTV products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Categories</option>
                    <option>Starlink</option>
                    <option>CCTV</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Prices</option>
                    <option>Under KES 10,000</option>
                    <option>KES 10,000 - 50,000</option>
                    <option>KES 50,000 - 100,000</option>
                    <option>Over KES 100,000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Brands</option>
                    <option>Starlink</option>
                    <option>Hikvision</option>
                    <option>Dahua</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
            {data?.meta ? `Showing ${data.meta.total} products` : 'Loading products...'}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Sort by:</span>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data?.map((product: Product) => (
              <Link key={product.id} to={`/products/${product.slug}`} className="group">
                <Card hover>
                  <ProductImageCarousel product={product} />
                  <CardBody className="pt-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.brand?.name || 'Brand'}</p>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-blue-600">KES {product.price.toLocaleString()}</span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-gray-400 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
                      )}
                    </div>
                    {product.compareAtPrice && (
                      <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                        Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                      </span>
                    )}
                  </CardBody>
                </Card>
              </Link>
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
                        ? 'bg-blue-600 text-white'
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