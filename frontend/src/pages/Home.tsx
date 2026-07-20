import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import { FiWifi, FiCamera, FiTool, FiTruck, FiPhone, FiShield, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?featured=true&limit=8');
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

        {/* CSS keyframe animations */}
        <style>{`
          @keyframes floatScene {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-10px); }
          }
          @keyframes ripple {
            0% { transform: scale(0.6); opacity: 0.9; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes beamGlow {
            0%, 100% { opacity: 0.3; stroke-width: 1px; }
            50% { opacity: 0.8; stroke-width: 2px; }
          }
          @keyframes wifiPulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 8px #22d3ee); }
          }
          @keyframes satTilt {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
          .float-scene { animation: floatScene 8s ease-in-out infinite; }
          .ripple-circle { animation: ripple 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; transform-origin: center; }
          .ripple-circle-2 { animation: ripple 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 1.33s; transform-origin: center; }
          .ripple-circle-3 { animation: ripple 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 2.66s; transform-origin: center; }
          .sat-float-1 { animation: satTilt 6s ease-in-out infinite; transform-origin: 170px 110px; }
          .sat-float-2 { animation: satTilt 8s ease-in-out infinite alternate; transform-origin: 430px 170px; }
          .wifi-node { animation: wifiPulse 3s ease-in-out infinite; transform-origin: 320px 208px; }
          .laser-beam { animation: beamGlow 2s ease-in-out infinite; }
        `}</style>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — text content */}
            <div>
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
                <Link to="/modules/starlink" className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2">
                  Shop Starlink Kits
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/modules/cctv" className="group bg-emerald-600/20 hover:bg-emerald-600/40 border-2 border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2">
                  <FiCamera size={20} />
                  Shop CCTV Systems
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

            {/* Right — animated Earth + satellites scene */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="float-scene relative w-[500px] h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
                {/* Photorealistic generated background image */}
                <img
                  src="/starlink_hero.png"
                  alt="Starlink Earth Horizon"
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                />

                {/* Cyber HUD & Signal telemetry overlay */}
                <div className="absolute top-3 left-3 bg-black/75 border border-blue-500/30 backdrop-blur-md rounded-lg p-2 font-mono text-[9px] text-cyan-400 pointer-events-none select-none z-10">
                  <div className="flex items-center gap-1.5 border-b border-blue-500/20 pb-1 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="font-bold text-white">ORBITAL BEAM LOCK</span>
                  </div>
                  <div>ALT: 550 KM</div>
                  <div>LATENCY: 24 MS</div>
                  <div>SIGNAL: SECURE</div>
                </div>

                {/* Animated overlays layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
                  <defs>
                    <filter id="laserGlow">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="wifiGlow">
                      <feGaussianBlur stdDeviation="6" />
                    </filter>
                  </defs>

                  {/* Concentric ripples from Satellite 1 (Top Left) */}
                  <g>
                    <circle cx="150" cy="130" r="45" stroke="#38bdf8" strokeWidth="0.8" fill="none" className="ripple-circle" opacity="0" />
                    <circle cx="150" cy="130" r="45" stroke="#38bdf8" strokeWidth="0.8" fill="none" className="ripple-circle-2" opacity="0" />
                    <circle cx="150" cy="130" r="45" stroke="#38bdf8" strokeWidth="0.8" fill="none" className="ripple-circle-3" opacity="0" />
                    <circle cx="150" cy="130" r="3.5" fill="#38bdf8" filter="url(#laserGlow)" className="glow-pulse" />
                  </g>

                  {/* Concentric ripples from Satellite 2 (Top Right) */}
                  <g>
                    <circle cx="360" cy="110" r="45" stroke="#38bdf8" strokeWidth="0.8" fill="none" className="ripple-circle" opacity="0" />
                    <circle cx="360" cy="110" r="45" stroke="#38bdf8" strokeWidth="0.8" fill="none" className="ripple-circle-2" opacity="0" />
                    <circle cx="360" cy="110" r="45" stroke="#38bdf8" strokeWidth="0.8" fill="none" className="ripple-circle-3" opacity="0" />
                    <circle cx="360" cy="110" r="3.5" fill="#38bdf8" filter="url(#laserGlow)" className="glow-pulse" />
                  </g>

                  {/* Laser Signal beam linking Satellite 1 to Wi-Fi ground station */}
                  <line x1="150" y1="130" x2="280" y2="340" stroke="#38bdf8" strokeWidth="1.8" className="laser-beam" opacity="0.8" filter="url(#laserGlow)" />

                  {/* Laser Signal beam linking Satellite 2 to Wi-Fi ground station */}
                  <line x1="360" y1="110" x2="280" y2="340" stroke="#06b6d4" strokeWidth="1.2" className="laser-beam" opacity="0.6" filter="url(#laserGlow)" />

                  {/* Glowing Wi-Fi receiver on the Earth curve */}
                  <g className="wifi-node" transform="translate(280, 340) scale(0.9)">
                    <circle cx="0" cy="0" r="16" fill="#22d3ee" opacity="0.2" filter="url(#wifiGlow)" />
                    {/* Wi-Fi arcs */}
                    <path d="M-10 -6 A 12 12 0 0 1 10 -6" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M-6 -2 A 7 7 0 0 1 6 -2" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <circle cx="0" cy="2" r="2.2" fill="#22d3ee" />
                  </g>

                  {/* compass coordinate ticks overlay */}
                  <g stroke="#0891b2" strokeWidth="0.8" opacity="0.3">
                    <line x1="250" y1="20" x2="250" y2="480" strokeDasharray="3 6" />
                    <line x1="20" y1="250" x2="480" y2="250" strokeDasharray="3 6" />
                  </g>
                </svg>
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
          <div className="bg-black/50 backdrop-blur-md rounded-3xl px-8 py-12 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-white drop-shadow-lg">Our Services</h2>
            <p className="text-gray-200 text-center mb-10 max-w-2xl mx-auto">
              Complete connectivity and security solutions for homes and businesses
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <FiWifi className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Starlink Internet</h3>
                <p className="text-gray-600 mb-4">
                  High-speed satellite internet anywhere in Kenya. Perfect for remote areas with no fiber coverage.
                </p>
                <Link to="/products" className="text-blue-600 font-semibold hover:underline">View Kits →</Link>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <FiCamera className="text-green-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">CCTV Systems</h3>
                <p className="text-gray-600 mb-4">
                  IP cameras, NVR systems, and complete surveillance for homes, offices, and large facilities.
                </p>
                <Link to="/products" className="text-blue-600 font-semibold hover:underline">View Cameras →</Link>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <FiTool className="text-purple-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Installation</h3>
                <p className="text-gray-600 mb-4">
                  Professional installation by certified technicians. Fast, clean, and guaranteed workmanship.
                </p>
                <Link to="/installation" className="text-blue-600 font-semibold hover:underline">Book Now →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-black/50 backdrop-blur-md rounded-3xl px-8 py-12 border border-white/10">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-white drop-shadow-lg">Featured Products</h2>
              <p className="text-gray-200 text-center mb-10">Our most popular items</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.map((product) => (
                  <Link key={product.id} to={`/products/${product.slug}`} className="bg-white/95 rounded-2xl shadow hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-white/20">
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-56 flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <FiCamera className="text-gray-400" size={48} />
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand?.name || 'Brand'}</p>
                      <h3 className="font-semibold text-lg mt-1 line-clamp-2 text-gray-900">{product.name}</h3>
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
                <Link to="/products" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-semibold">
                  View All Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-black/50 backdrop-blur-md rounded-3xl px-8 py-12 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-white drop-shadow-lg">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTruck className="text-blue-600" size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Fast Delivery</h3>
                <p className="text-gray-600 text-sm">Nationwide shipping within 24-48 hours</p>
              </div>
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="text-green-600" size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Warranty</h3>
                <p className="text-gray-600 text-sm">All products come with manufacturer warranty</p>
              </div>
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTool className="text-purple-600" size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Expert Installation</h3>
                <p className="text-gray-600 text-sm">Certified technicians with years of experience</p>
              </div>
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPhone className="text-orange-600" size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">24/7 Support</h3>
                <p className="text-gray-600 text-sm">Always available to help via phone or WhatsApp</p>
              </div>
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
            <a href="https://wa.me/254727572310" target="_blank" className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl text-lg font-semibold transition">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}