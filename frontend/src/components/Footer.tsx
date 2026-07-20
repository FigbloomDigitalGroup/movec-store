import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Starlink CCTV</span>
            </div>
            <p className="text-gray-700 mb-4">
              Your trusted partner for Starlink internet and AI-powered CCTV security solutions in Kenya.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-700 hover:text-blue-600 transition">Products</Link>
              </li>
              <li>
                <Link to="/modules/starlink" className="text-gray-700 hover:text-blue-600 transition">Starlink Kits</Link>
              </li>
              <li>
                <Link to="/cctv" className="text-gray-700 hover:text-blue-600 transition">CCTV Systems</Link>
              </li>
              <li>
                <Link to="/installation" className="text-gray-700 hover:text-blue-600 transition">Installation</Link>
              </li>
              <li>
                <Link to="/support/faqs" className="text-gray-700 hover:text-blue-600 transition">FAQs</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">Contact Us</Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-700 hover:text-blue-600 transition">Track Order</Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition">My Account</Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-700 hover:text-blue-600 transition">Wishlist</Link>
              </li>
              <li>
                <Link to="/support/faqs" className="text-gray-700 hover:text-blue-600 transition">Support</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                <span className="text-gray-700">Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-gray-400 flex-shrink-0" size={18} />
                <a href="tel:+254727572310" className="text-gray-700 hover:text-blue-600 transition">
                  +254 727572310
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-gray-400 flex-shrink-0" size={18} />
                <a href="mailto:info@starlinkcctv.co.ke" className="text-gray-700 hover:text-blue-600 transition">
                  info@starlinkcctv.co.ke
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiClock className="text-gray-400 flex-shrink-0" size={18} />
                <span className="text-gray-700">Mon-Sat: 8AM - 6PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Starlink CCTV. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="#" className="text-gray-600 hover:text-blue-600 transition">Privacy Policy</Link>
              <Link to="#" className="text-gray-600 hover:text-blue-600 transition">Terms of Service</Link>
              <Link to="#" className="text-gray-600 hover:text-blue-600 transition">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}