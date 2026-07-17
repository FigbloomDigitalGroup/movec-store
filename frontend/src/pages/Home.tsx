import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?limit=4');
      return data.data as Product[];
    },
  });

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-900 to-gray-900 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">Starlink & CCTV Solutions</h1>
        <p className="text-xl mb-8">High-speed satellite internet and professional security systems across Kenya</p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="bg-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">Shop Now</Link>
          <Link to="/installation" className="border border-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition">Book Installation</Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured?.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4">
              <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <span className="text-gray-400">No image</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{product.shortDescription}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-bold text-blue-600">KES {product.price.toLocaleString()}</span>
                {product.compareAtPrice && (
                  <span className="text-sm text-gray-400 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-xl font-bold mb-2">Starlink Internet</h3>
            <p className="text-gray-600">High-speed satellite internet anywhere in Kenya. Kits and accessories available.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">📹</div>
            <h3 className="text-xl font-bold mb-2">CCTV Security</h3>
            <p className="text-gray-600">IP cameras, DVR/NVR systems, and complete surveillance solutions.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">🔧</div>
            <h3 className="text-xl font-bold mb-2">Professional Installation</h3>
            <p className="text-gray-600">Expert technicians for Starlink and CCTV installation across Kenya.</p>
          </div>
        </div>
      </section>
    </div>
  );
}