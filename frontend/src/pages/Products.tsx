import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import { FiSearch } from 'react-icons/fi';

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
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchParams(search ? { search } : {})}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.data?.map((product: Product) => (
            <Link key={product.id} to={`/products/${product.slug}`} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4">
              <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <span className="text-gray-400">No image</span>
                )}
              </div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.brand?.name}</p>
              <p className="text-lg font-bold text-blue-600 mt-2">KES {product.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}

      {data?.meta && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            disabled={searchParams.get('page') === '1' || !searchParams.get('page')}
            onClick={() => {
              const page = parseInt(searchParams.get('page') || '1') - 1;
              const params = new URLSearchParams(searchParams);
              params.set('page', String(page));
              setSearchParams(params);
            }}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {searchParams.get('page') || 1} of {Math.ceil(data.meta.total / data.meta.limit)}</span>
          <button
            disabled={parseInt(searchParams.get('page') || '1') >= Math.ceil(data.meta.total / data.meta.limit)}
            onClick={() => {
              const page = parseInt(searchParams.get('page') || '1') + 1;
              const params = new URLSearchParams(searchParams);
              params.set('page', String(page));
              setSearchParams(params);
            }}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}