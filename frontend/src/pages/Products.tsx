import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
    <div className="relative bg-gray-200 h-48 rounded-lg overflow-hidden group">
      {images.length > 0 ? (
        <img
          src={images[currentIndex]?.url}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-400">No image</div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
          >
            <FiChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
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

  const { data, isLoading } = useQuery({
    queryKey: ['products', searchParams.toString()],
    queryFn: async () => {
      const { data } = await api.get(`/products?${searchParams.toString()}`);
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-white">Products</h1>
      <p className="text-gray-300 mb-6">Browse our full catalog</p>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchParams(search ? { search } : {})}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white/90 backdrop-blur-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.data?.map((product: Product) => (
            <Link
              key={product.id}
              to={`/products/${product.slug}`}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <ProductImageCarousel product={product} />
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.brand?.name}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">KES {product.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data?.meta && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            disabled={parseInt(searchParams.get('page') || '1') <= 1}
            onClick={() => {
              const page = parseInt(searchParams.get('page') || '1') - 1;
              const params = new URLSearchParams(searchParams);
              if (page <= 1) params.delete('page'); else params.set('page', String(page));
              setSearchParams(params);
            }}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-white">
            Page {searchParams.get('page') || 1} of {Math.ceil(data.meta.total / data.meta.limit)}
          </span>
          <button
            disabled={parseInt(searchParams.get('page') || '1') >= Math.ceil(data.meta.total / data.meta.limit)}
            onClick={() => {
              const page = parseInt(searchParams.get('page') || '1') + 1;
              const params = new URLSearchParams(searchParams);
              params.set('page', String(page));
              setSearchParams(params);
            }}
            className="px-4 py-2 bg-white/80 backdrop-blur-sm border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}