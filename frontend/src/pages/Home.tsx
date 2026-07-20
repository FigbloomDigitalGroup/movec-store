import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import { FiWifi, FiCamera, FiTool, FiTruck, FiPhone, FiShield, FiArrowRight, FiCheckCircle, FiStar } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?featured=true&limit=8');
      return data.data as Product[];
    },
  });

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <FiWifi className="text-cyan-300" />
                <span className="text-cyan-100 text-sm font-medium">Official Starlink Reseller in Kenya</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                High-Speed Internet
                <br />
                <span className="text-cyan-300">From Space to Your Home</span>
              </h1>

              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
                Get Starlink satellite internet anywhere in Kenya. Ultra-fast speeds,
                low latency, and easy self-installation. Perfect for remote areas where
                traditional internet can't reach.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/modules/starlink" className="group">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Shop Starlink Kits
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/cctv" className="group">
                  <Button variant="secondary" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <FiCamera className="mr-2" size={20} />
                    Shop CCTV Systems
                  </Button>
                </Link>
                <Link to="/installation" className="group">
                  <Button variant="secondary" className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white hover:bg-white/10">
                    Book Installation
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiWifi className="text-cyan-300" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">200+ Mbps</p>
                    <p className="text-blue-200 text-xs">Download Speeds</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle className="text-cyan-300" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Unlimited Data</p>
                    <p className="text-blue-200 text-xs">No Caps</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiTool className="text-cyan-300" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Easy Setup</p>
                    <p className="text-blue-200 text-xs">Self-Install</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <FiShield className="text-white/80" size={120} />
                </div>
                <div className="absolute -top-4 -right-4 bg-cyan-400 rounded-2xl p-4 shadow-xl">
                  <FiWifi className="text-white" size={32} />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-400 rounded-2xl p-4 shadow-xl">
                  <FiCamera className="text-white" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-900">500+</p>
            <p className="text-sm text-gray-700">Starlink Installations</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">47</p>
            <p className="text-sm text-gray-700">Counties Covered</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">24/7</p>
            <p className="text-sm text-gray-700">Customer Support</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">KES 6,500</p>
            <p className="text-sm text-gray-700">Monthly Subscription</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Complete connectivity and security solutions for homes and businesses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card hover>
              <CardBody>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <FiWifi className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Starlink Internet</h3>
                <p className="text-gray-700 mb-4">
                  High-speed satellite internet anywhere in Kenya. Perfect for remote areas with no fiber coverage.
                </p>
                <Link to="/products" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                  View Kits <FiArrowRight size={16} />
                </Link>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <FiCamera className="text-green-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">CCTV Systems</h3>
                <p className="text-gray-700 mb-4">
                  AI-powered IP cameras, NVR systems, and complete surveillance for homes and businesses.
                </p>
                <Link to="/cctv" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                  Learn More <FiArrowRight size={16} />
                </Link>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody>
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <FiTool className="text-purple-600" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Installation</h3>
                <p className="text-gray-700 mb-4">
                  Professional installation by certified technicians. Fast, clean, and guaranteed workmanship.
                </p>
                <Link to="/installation" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                  Book Now <FiArrowRight size={16} />
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-700">Our most popular items</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <Link key={product.id} to={`/products/${product.slug}`} className="group">
                  <Card hover>
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-56 flex items-center justify-center rounded-t-xl overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <FiCamera className="text-gray-400" size={48} />
                      )}
                    </div>
                    <CardBody className="pt-5">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.brand?.name || 'Brand'}</p>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition">{product.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">KES {product.price.toLocaleString()}</span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-gray-400 line-through">KES {product.compareAtPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/products">
                <Button variant="primary">View All Products</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Trusted by hundreds of customers across Kenya
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card hover>
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTruck className="text-blue-600" size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Fast Delivery</h3>
                <p className="text-gray-700 text-sm">Nationwide shipping within 24-48 hours</p>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="text-green-600" size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Warranty</h3>
                <p className="text-gray-700 text-sm">All products come with manufacturer warranty</p>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTool className="text-purple-600" size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Expert Installation</h3>
                <p className="text-gray-700 text-sm">Certified technicians with years of experience</p>
              </CardBody>
            </Card>
            <Card hover>
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPhone className="text-orange-600" size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">24/7 Support</h3>
                <p className="text-gray-700 text-sm">Always available to help via phone or WhatsApp</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-700">Real reviews from satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardBody>
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar key={star} className="text-yellow-400 fill-yellow-400" size={16} />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">
                    "Excellent service and fast delivery. The Starlink installation was quick and the internet speed is amazing!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">JD</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">John Doe</p>
                      <p className="text-sm text-gray-500">Nairobi</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Connected?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Order your Starlink kit today. Professional installation available nationwide.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products">
              <Button variant="secondary" className="w-full sm:w-auto">Shop Now</Button>
            </Link>
            <a href="https://wa.me/254727572310" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto bg-green-500 border-green-500 text-white hover:bg-green-600">
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}