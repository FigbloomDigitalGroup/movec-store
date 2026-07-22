import { Link } from 'react-router-dom';
import { FiTarget, FiUser, FiAlertTriangle, FiPackage, FiSmile, FiSmartphone, FiMoon, FiCheck, FiArrowRight, FiShield, FiVideo, FiHome, FiShoppingBag, FiActivity, FiMap, FiMonitor as FiBuilding, FiBookOpen as FiBook, FiTool } from 'react-icons/fi';
import AnimatedContent from '../components/AnimatedContent';

export default function CCTVModule() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <FiVideo className="text-cyan-300" />
                <span className="text-cyan-100 text-sm font-medium">AI-Powered Security</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                AI-Powered Security
                <br />
                <span className="text-cyan-300">with OpenCV</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Smarter surveillance. Faster response. Better protection. Modern CCTV systems with computer vision technologies analyze video in real time, detect important events, and help you respond before incidents escalate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products?category=cctv" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition">
                  Shop CCTV Systems
                  <FiArrowRight />
                </Link>
                <Link to="/installation" className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition">
                  Book Installation
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <FiShield className="text-white/80" size={120} />
                </div>
                <div className="absolute -top-4 -right-4 bg-cyan-400 rounded-2xl p-4 shadow-xl">
                  <FiSmile className="text-white" size={32} />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-400 rounded-2xl p-4 shadow-xl">
                  <FiTarget className="text-white" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Benefits</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Advanced AI features that take your security to the next level
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FiTarget,
                title: 'Intelligent Motion Detection',
                description: 'Receive alerts only when meaningful movement is detected, reducing false alarms caused by wind, rain, or lighting changes.',
                color: 'blue'
              },
              {
                icon: FiUser,
                title: 'Human & Vehicle Detection',
                description: 'Differentiate between people, vehicles, and other moving objects to improve monitoring accuracy.',
                color: 'green'
              },
              {
                icon: FiAlertTriangle,
                title: 'Intrusion Detection',
                description: 'Automatically detect unauthorized entry into restricted areas and receive instant notifications.',
                color: 'red'
              },
              {
                icon: FiPackage,
                title: 'Object Detection',
                description: 'Monitor valuable assets and receive alerts when objects are removed, left behind, or moved unexpectedly.',
                color: 'purple'
              },
              {
                icon: FiMap,
                title: 'License Plate Recognition',
                description: 'Capture and identify vehicle registration numbers for homes, businesses, parking lots, and gated communities.',
                color: 'orange'
              },
              {
                icon: FiSmile,
                title: 'Face Recognition',
                description: 'Identify authorized personnel or recognize familiar faces for enhanced access control (Supported Models).',
                color: 'pink'
              },
              {
                icon: FiSmartphone,
                title: 'Remote Monitoring',
                description: 'View live footage and recorded videos securely from anywhere using your smartphone, tablet, or computer.',
                color: 'cyan'
              },
              {
                icon: FiMoon,
                title: 'Crystal Clear Night Vision',
                description: 'Advanced infrared technology delivers reliable surveillance even in complete darkness.',
                color: 'indigo'
              }
            ].map((benefit, index) => (
              <AnimatedContent key={index} distance={30} direction="vertical" duration={0.6} delay={index * 0.05}>
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 h-full">
                <div className={`w-12 h-12 bg-${benefit.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <benefit.icon className={`text-${benefit.color}-600`} size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-700 text-sm">{benefit.description}</p>
              </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our CCTV Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Our CCTV Solutions?</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Premium quality with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'High-definition video quality (2MP, 4MP, 5MP & 4K)',
              'AI-powered detection features',
              'Weatherproof outdoor cameras (IP66/IP67)',
              'Reliable 24/7 monitoring',
              'Mobile app access',
              'Easy installation and setup',
              'Expandable systems for homes and businesses',
              'Professional after-sales support'
            ].map((feature, index) => (
              <AnimatedContent key={index} distance={20} direction="horizontal" duration={0.5} delay={index * 0.05}>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 h-full">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiCheck className="text-green-600" size={16} />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Perfect For */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Perfect For</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Versatile security solutions for every environment
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: <FiHome />, name: 'Homes' },
              { icon: <FiBuilding />, name: 'Offices' },
              { icon: <FiShoppingBag />, name: 'Retail Shops' },
              { icon: <FiBook />, name: 'Schools' },
              { icon: <FiActivity />, name: 'Hospitals' },
              { icon: <FiTool />, name: 'Warehouses' },
              { icon: <FiMap />, name: 'Parking Lots' },
              { icon: <FiShield />, name: 'Hotels' },
              { icon: <FiHome />, name: 'Churches' },
              { icon: <FiHome />, name: 'Estates' }
            ].map((place, index) => (
              <AnimatedContent key={index} distance={30} direction="vertical" duration={0.5} delay={index * 0.05}>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full">
                <div className="text-blue-600 mx-auto mb-3 text-3xl flex justify-center">{place.icon}</div>
                <span className="text-gray-700 font-medium">{place.name}</span>
              </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Features Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Smart Features Available</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Compare features and their benefits
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Benefit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'AI Motion Detection', benefit: 'Reduces unnecessary alerts' },
                  { feature: 'Human Detection', benefit: 'Detects people more accurately' },
                  { feature: 'Vehicle Detection', benefit: 'Identifies vehicles separately' },
                  { feature: 'Face Recognition*', benefit: 'Enhanced access management' },
                  { feature: 'License Plate Recognition*', benefit: 'Vehicle identification' },
                  { feature: 'Night Vision', benefit: '24/7 surveillance' },
                  { feature: 'Mobile Notifications', benefit: 'Instant alerts' },
                  { feature: 'Remote Viewing', benefit: 'Monitor from anywhere' },
                  { feature: 'Two-Way Audio*', benefit: 'Communicate through the camera' },
                  { feature: 'Smart Tracking*', benefit: 'Camera follows moving objects' }
                ].map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">{item.feature}</td>
                    <td className="px-6 py-4 text-gray-700">{item.benefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600">
              *Available on selected models
            </div>
          </div>
        </div>
      </section>

      {/* Why Buy From Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Buy From Us?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Your trusted partner for security solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                'Genuine CCTV products',
                'Competitive pricing',
                'Fast nationwide delivery',
                'Professional installation services',
                'Warranty included',
                'Expert technical support',
                'Secure payment options',
                '24/7 customer support'
              ].map((reason, index) => (
                <AnimatedContent key={index} distance={20} direction="horizontal" duration={0.5} delay={index * 0.05}>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 h-full">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-blue-600" size={16} />
                  </div>
                  <span className="font-medium">{reason}</span>
                </div>
                </AnimatedContent>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products?category=cctv" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition">
                Browse CCTV Products
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Upgrade Your Security?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Get AI-powered CCTV systems with professional installation. Protect what matters most.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products?category=cctv" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition">
              Shop CCTV Systems
              <FiArrowRight />
            </Link>
            <Link to="/installation" className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition">
              Book Installation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
