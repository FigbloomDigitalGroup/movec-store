import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from '../types';
import {
  FiWifi,
  FiCamera,
  FiTool,
  FiTruck,
  FiPhone,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
  FiStar,
  FiMessageSquare,
} from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import ProductCard from '../components/ProductCard';
import TextType from '../components/TextType';
import ScrollFloat from '../components/ScrollFloat';
import AnimatedContent from '../components/AnimatedContent';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Testimonial {
  name: string;
  location: string;
  product: string;
  rating: number;
  verified: boolean;
  date: string;
  review: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'James Mwangi',
    location: 'Nairobi',
    product: 'Starlink Standard Kit',
    rating: 5,
    verified: true,
    date: 'June 2026',
    review:
      'Delivery was next day and installation took less than an hour. The team was professional and the internet has been flawless since day one.',
  },
  {
    name: 'Grace Wanjiku',
    location: 'Nakuru',
    product: 'Hikvision CCTV System',
    rating: 5,
    verified: true,
    date: 'May 2026',
    review:
      'Excellent CCTV installation. The mobile app works perfectly and the technicians explained everything clearly before leaving.',
  },
  {
    name: 'Brian Otieno',
    location: 'Kisumu',
    product: 'Starlink Mini',
    rating: 5,
    verified: true,
    date: 'July 2026',
    review:
      'Fast delivery and excellent customer service. Setup was straightforward and speeds exceeded what I was expecting for a rural area.',
  },
  {
    name: 'Fatuma Hassan',
    location: 'Mombasa',
    product: 'Starlink Standard Kit + CCTV Bundle',
    rating: 5,
    verified: true,
    date: 'April 2026',
    review:
      'Booked both installs together and the crew handled it in one visit. Support has answered every WhatsApp message within minutes.',
  },
  {
    name: 'Kevin Kiprono',
    location: 'Eldoret',
    product: 'Dahua CCTV System',
    rating: 4,
    verified: true,
    date: 'June 2026',
    review:
      'Solid system, good night vision on the cameras. Took an extra day to get an installer out to us but the work itself was clean.',
  },
];

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products?featured=true&limit=8');
      return data.data as Product[];
    },
  });

  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, duration: 30, align: 'start', skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const [testimonialRef] = useEmblaCarousel(
    { loop: true, dragFree: true, duration: 30, align: 'start', skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative z-10 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <FiWifi className="text-cyan-300" />
                <span className="text-cyan-100 text-sm font-medium">Official Starlink Reseller in Kenya</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-hero-bold mb-6 leading-tight">
                <TextType
                  text="High-Speed Internet From Space to Your Home Anywhere in Kenya"
                  typingSpeed={75}
                  showCursor={false}
                  loop={false}
                  className="text-white"
                />
              </h1>

              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
                Get Starlink satellite internet anywhere in Kenya. Ultra-fast speeds,
                low latency, and easy self-installation. Perfect for remote areas where
                traditional internet can't reach.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/solutions/starlink" className="group">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Shop Starlink Kits
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/solutions/cctv" className="group">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    <FiCamera className="mr-2" size={20} />
                    Shop CCTV Systems
                  </Button>
                </Link>
                <Link to="/installation" className="group">
                  <Button variant="secondary" className="w-full sm:w-auto">
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
                    <p className="text-white font-semibold text-sm">Up to 300+ Mbps</p>
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
      <section className="relative z-0 bg-white border-b border-gray-200 py-8">
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
            <p className="text-3xl font-bold text-gray-900">From KES 4,500 </p>
            <p className="text-sm text-gray-700">Monthly Subscription</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <ScrollFloat animationDuration={1} ease='back.inOut(2)' scrollStart='center bottom+=50%' scrollEnd='bottom bottom-=40%' stagger={0.03} containerClassName="mb-4">
              Our Services
            </ScrollFloat>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Complete connectivity and security solutions for homes and businesses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.1}>
              <Card hover>
                <CardBody>
                  <FiWifi className="text-blue-600 mb-6" size={28} />
                  <h3 className="text-xl font-product-name mb-3 text-gray-900">Starlink Internet</h3>
                  <p className="text-gray-700 mb-4">
                    High-speed satellite internet anywhere in Kenya. Perfect for remote areas with no fiber coverage.
                  </p>
                  <Link to="/solutions/starlink" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                    Learn More <FiArrowRight size={16} />
                  </Link>
                </CardBody>
              </Card>
            </AnimatedContent>
            <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.2}>
              <Card hover>
                <CardBody>
                  <FiCamera className="text-green-600 mb-6" size={28} />
                  <h3 className="text-xl font-product-name mb-3 text-gray-900">CCTV Systems</h3>
                  <p className="text-gray-700 mb-4">
                    AI-powered IP cameras, NVR systems, and complete surveillance for homes and businesses.
                  </p>
                  <Link to="/solutions/cctv" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                    Learn More <FiArrowRight size={16} />
                  </Link>
                </CardBody>
              </Card>
            </AnimatedContent>
            <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.3}>
              <Card hover>
                <CardBody>
                  <FiTool className="text-purple-600 mb-6" size={28} />
                  <h3 className="text-xl font-product-name mb-3 text-gray-900">Installation</h3>
                  <p className="text-gray-700 mb-4">
                    Professional installation by certified technicians. Fast, clean, and guaranteed workmanship.
                  </p>
                  <Link to="/installation" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                    Book Now <FiArrowRight size={16} />
                  </Link>
                </CardBody>
              </Card>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <ScrollFloat animationDuration={1} ease='back.inOut(2)' scrollStart='center bottom+=50%' scrollEnd='bottom bottom-=40%' stagger={0.03} containerClassName="mb-4">
                Featured Products
              </ScrollFloat>
              <p className="text-xl text-gray-700">Our most popular items</p>
            </div>
            <div className="embla overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex -mx-3 [backface-visibility:hidden] [touch-action:pan-y]">
                {featured.map((product, idx) => (
                  <div
                    key={product.id}
                    className="embla__slide flex-[0_0_90%] sm:flex-[0_0_60%] md:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_25%] min-w-0 px-3 pb-6 cursor-grab active:cursor-grabbing transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-2">
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
            <h2 className="text-3xl md:text-4xl font-section-title text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Trusted by hundreds of customers across Kenya
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.1}>
              <Card hover>
                <CardBody className="text-center">
                  <FiTruck className="text-blue-600 mb-4 mx-auto" size={28} />
                  <h3 className="font-product-name text-lg mb-2 text-gray-900">Fast Delivery</h3>
                  <p className="text-gray-700 text-sm">Nationwide shipping within 24-48 hours</p>
                </CardBody>
              </Card>
            </AnimatedContent>
            <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.2}>
              <Card hover>
                <CardBody className="text-center">
                  <FiShield className="text-green-600 mb-4 mx-auto" size={28} />
                  <h3 className="font-product-name text-lg mb-2 text-gray-900">Warranty</h3>
                  <p className="text-gray-700 text-sm">All products come with manufacturer warranty</p>
                </CardBody>
              </Card>
            </AnimatedContent>
            <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.3}>
              <Card hover>
                <CardBody className="text-center">
                  <FiTool className="text-purple-600 mb-4 mx-auto" size={28} />
                  <h3 className="font-product-name text-lg mb-2 text-gray-900">Expert Installation</h3>
                  <p className="text-gray-700 text-sm">Certified technicians with years of experience</p>
                </CardBody>
              </Card>
            </AnimatedContent>
            <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.4}>
              <Card hover>
                <CardBody className="text-center">
                  <FiPhone className="text-orange-600 mb-4 mx-auto" size={28} />
                  <h3 className="font-product-name text-lg mb-2 text-gray-900">24/7 Support</h3>
                  <p className="text-gray-700 text-sm">Always available to help via phone or WhatsApp</p>
                </CardBody>
              </Card>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-section-title text-gray-900 mb-4">
              Trusted by Customers Across Kenya
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Over 500 successful installations with an average customer rating of 4.9/5.
            </p>
          </div>

          {/* Trust stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-14 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar key={s} className="fill-yellow-400" size={16} />
                ))}
              </div>
              <p className="text-2xl font-bold text-gray-900">4.9</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">500+</p>
              <p className="text-sm text-gray-500">Installations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-sm text-gray-500">Satisfied Customers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">47</p>
              <p className="text-sm text-gray-500">Counties Served</p>
            </div>
          </div>

          <div className="embla overflow-hidden" ref={testimonialRef}>
            <div className="embla__container flex -mx-3 [backface-visibility:hidden] [touch-action:pan-y]">
              {testimonials.map((t, idx) => (
                <div
                  key={t.name}
                  className="embla__slide flex-[0_0_90%] sm:flex-[0_0_60%] md:flex-[0_0_45%] lg:flex-[0_0_33%] min-w-0 px-3 pb-6 cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="h-full"
                  >
                    <Card
                      hover
                      className="relative rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 h-full overflow-hidden"
                    >
                      <FiMessageSquare
                        className="absolute top-4 right-4 text-gray-900 opacity-[0.06]"
                        size={64}
                      />
                      <CardBody className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                size={16}
                                className={
                                  star <= t.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-200 fill-gray-200'
                                }
                              />
                            ))}
                          </div>
                          {t.verified && (
                            <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 rounded-full px-2 py-1">
                              <FiCheckCircle size={12} />
                              Verified Purchase
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 mb-6 leading-relaxed">"{t.review}"</p>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {t.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{t.name}</p>
                            <p className="text-sm text-blue-600 truncate">{t.product}</p>
                            <p className="text-xs text-gray-500">
                              {t.location} · {t.date}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center overflow-hidden">
        <AnimatedContent distance={50} direction="vertical" duration={0.8}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Connected?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Order your Starlink kit today. Professional installation available nationwide.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/products">
                <Button variant="secondary" className="w-full sm:w-auto">Shop Now</Button>
              </Link>
              <a href="https://wa.me/254796285718" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto !bg-green-500 !border-green-500 !text-white hover:!bg-green-600 focus:!ring-green-500">
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </div>
        </AnimatedContent>
      </section>
    </div>
  );
}
