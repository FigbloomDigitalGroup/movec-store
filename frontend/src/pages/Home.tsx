import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import {
  FiWifi,
  FiCamera,
  FiZap,
  FiPackage,
} from 'react-icons/fi';
import ProductCarousel from '../components/ProductCarousel';

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?featured=true&limit=100');
      return data.data as Product[];
    },
  });

  const { data: bestSellers } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: async () => {
      const { data } = await api.get('/products?bestSeller=true&limit=100');
      return data.data as Product[];
    },
  });


  return (
    <div className="min-h-screen">

      {/* ══════════════════════════════════════
          APPLE-STYLE HERO SECTION
      ══════════════════════════════════════ */}
      <section className="border-b border-gray-200/50 py-16 md:py-24">
        <div className="w-full px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-16">
            
            {/* Left: Large, bold heading */}
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-none">
                Store
              </h1>
            </div>

            {/* Right: Supporting content with links */}
            <div className="flex-1 text-right space-y-3">
              <p className="text-lg text-gray-600 max-w-md ml-auto">
                The latest Starlink kits, CCTV systems, and networking gear — all in one place.
              </p>
              <div className="flex items-center justify-end gap-6">
                <Link
                  to="/products"
                  className="text-primary-500 hover:text-primary-600 text-base font-medium flex items-center gap-1 transition"
                >
                  Browse All Products <span className="text-secondary-500">›</span>
                </Link>
                  <Link
                    to="/categories"
                    className="text-primary-500 hover:text-primary-600 text-base font-medium flex items-center gap-1 transition"
                  >
                    Browse categories <span className="text-secondary-500">›</span>
                  </Link>
              </div>
            </div>

          </div>
        </div>
      </section>





      {/* ══════════════════════════════════════
          APPLE-STYLE PRODUCT ROW: BEST SELLERS
      ══════════════════════════════════════ */}
      <section className="py-12">
        <div className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Best Sellers</h2>
            <Link
              to="/products"
              className="text-primary-500 hover:text-primary-600 text-base font-medium flex items-center gap-1 transition"
            >
              See all <span className="text-secondary-500">›</span>
            </Link>
          </div>

          <ProductCarousel products={bestSellers ?? []} viewAllLink="/products?bestSeller=true" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          APPLE-STYLE CATEGORY ROW
      ══════════════════════════════════════ */}
      <section className="py-12">
        <div className="w-full px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Shop by Category</h2>
            <Link
              to="/categories"
              className="text-primary-500 hover:text-primary-600 text-base font-medium flex items-center gap-1 transition"
            >
              See all <span className="text-secondary-500">›</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <Link to="/solutions/starlink" className="group block text-center">
              <div className="mb-3">
                <FiWifi className="mx-auto text-gray-400 group-hover:text-primary-500 transition-colors" size={32} />
              </div>
              <p className="text-sm text-gray-900 font-medium group-hover:text-primary-500 transition-colors">Starlink</p>
            </Link>

            <Link to="/solutions/cctv" className="group block text-center">
              <div className="mb-3">
                <FiCamera className="mx-auto text-gray-400 group-hover:text-primary-500 transition-colors" size={32} />
              </div>
              <p className="text-sm text-gray-900 font-medium group-hover:text-primary-500 transition-colors">CCTV</p>
            </Link>

            <Link to="/products?category=networking" className="group block text-center">
              <div className="mb-3">
                <FiZap className="mx-auto text-gray-400 group-hover:text-primary-500 transition-colors" size={32} />
              </div>
              <p className="text-sm text-gray-900 font-medium group-hover:text-primary-500 transition-colors">Networking</p>
            </Link>

            <Link to="/products?category=accessories" className="group block text-center">
              <div className="mb-3">
                <FiPackage className="mx-auto text-gray-400 group-hover:text-primary-500 transition-colors" size={32} />
              </div>
              <p className="text-sm text-gray-900 font-medium group-hover:text-primary-500 transition-colors">Accessories</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          APPLE-STYLE PRODUCT ROW: FEATURED
      ══════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-12">
          <div className="w-full px-4 md:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Featured</h2>
              <Link
                to="/products"
                className="text-primary-500 hover:text-primary-600 text-base font-medium flex items-center gap-1 transition"
              >
                See all <span className="text-secondary-500">›</span>
              </Link>
            </div>

            <ProductCarousel products={featured} viewAllLink="/products?featured=true" />
          </div>
        </section>
      )}

    </div>
  );
}
