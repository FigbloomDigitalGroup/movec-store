import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import { FiWifi, FiCamera, FiTool, FiTruck, FiPhone, FiShield, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

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
      {/* Hero Section - Starlink Focused */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950 to-gray-900">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 50% 70%, #fff, transparent), radial-gradient(1px 1px at 80% 20%, #fff, transparent), radial-gradient(1px 1px at 30% 80%, #fff, transparent), radial-gradient(2px 2px at 70% 40%, rgba(96,165,250,0.8), transparent), radial-gradient(2px 2px at 10% 60%, rgba(96,165,250,0.6), transparent), radial-gradient(2px 2px at 90% 50%, rgba(96,165,250,0.7), transparent)',
            backgroundSize: '200px 200px, 300px 300px, 250px 250px, 180px 180px, 400px 400px, 350px 350px, 280px 280px',
          }} />
        </div>

        {/* Satellite dish silhouette */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="300" cy="280" r="180" stroke="white" strokeWidth="2" fill="none" opacity="0.5"/>
            <circle cx="300" cy="280" r="120" stroke="white" strokeWidth="1" fill="none" opacity="0.3"/>
            <circle cx="300" cy="280" r="60" stroke="white" strokeWidth="1" fill="none" opacity="0.2"/>
            <line x1="300" y1="100" x2="300" y2="460" stroke="white" strokeWidth="1" opacity="0.3"/>
            <line x1="120" y1="280" x2="480" y2="280" stroke="white" strokeWidth="1" opacity="0.3"/>
            <circle cx="300" cy="280" r="8" fill="white" opacity="0.6"/>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
              <FiWifi className="text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Official Starlink Reseller in Kenya</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              High-Speed Internet
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                From Space to Your Home
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
              Get Starlink satellite internet anywhere in Kenya. Ultra-fast speeds, 
              low latency, and easy self-installation. Perfect for remote areas where 
              traditional internet can't reach.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/products" className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2">
                Shop Starlink Kits
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/installation" className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2">
                Book Installation
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiWifi className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">200+ Mbps</p>
                  <p className="text-gray-400 text-xs">Download Speeds</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Unlimited Data</p>
                  <p className="text-gray-400 text-xs">No Caps</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiTool className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Easy Setup</p>
                  <p className="text-gray-400 text-xs">Self-Install</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-blue-600/80 backdrop-blur-sm text-white py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">500+</p>
            <p className="text-sm opacity-80">Starlink Installations</p>
          </div>
          <div>
            <p className="text-3xl font-bold">47</p>
            <p className="text-sm opacity-80">Counties Covered</p>
          </div>
          <div>
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-sm opacity-80">Customer Support</p>
          </div>
          <div>
            <p className="text-3xl font-bold">KES 6,500</p>
            <p className="text-sm opacity-80">Monthly Subscription</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">Our Services</h2>
          <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Complete connectivity and security solutions for homes and businesses
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FiWifi className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Starlink Internet</h3>
              <p className="text-gray-600 mb-4">
                High-speed satellite internet anywhere in Kenya. Perfect for remote areas with no fiber coverage.
              </p>
              <Link to="/products" className="text-blue-600 font-semibold hover:underline">View Kits →</Link>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <FiCamera className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">CCTV Systems</h3>
              <p className="text-gray-600 mb-4">
                IP cameras, NVR systems, and complete surveillance for homes, offices, and large facilities.
              </p>
              <Link to="/products" className="text-blue-600 font-semibold hover:underline">View Cameras →</Link>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <FiTool className="text-purple-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Installation</h3>
              <p className="text-gray-600 mb-4">
                Professional installation by certified technicians. Fast, clean, and guaranteed workmanship.
              </p>
              <Link to="/installation" className="text-blue-600 font-semibold hover:underline">Book Now →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">Featured Products</h2>
            <p className="text-gray-300 text-center mb-12">Our most popular items</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <Link key={product.id} to={`/products/${product.slug}`} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1 overflow-hidden">
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-56 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <FiCamera className="text-gray-400" size={48} />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand?.name || 'Brand'}</p>
                    <h3 className="font-semibold text-lg mt-1 line-clamp-2">{product.name}</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-600">KES {product.price.toLocaleString()}</span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-gray-400 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/products" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="text-blue-600" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Nationwide shipping within 24-48 hours</p>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-green-600" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">Warranty</h3>
              <p className="text-gray-600 text-sm">All products come with manufacturer warranty</p>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTool className="text-purple-600" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">Expert Installation</h3>
              <p className="text-gray-600 text-sm">Certified technicians with years of experience</p>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPhone className="text-orange-600" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Always available to help via phone or WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black/60 backdrop-blur-sm text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Connected?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Order your Starlink kit today. Professional installation available nationwide.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-lg font-semibold transition">
              Shop Now
            </Link>
            <a href="https://wa.me/254700000000" target="_blank" className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl text-lg font-semibold transition">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}