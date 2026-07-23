import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa6';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center mb-4">
              <img src={logo} alt="Movec Store" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-gray-700 mb-4">
              Your trusted partner for Starlink internet, AI-powered CCTV security, networking equipment, and smart devices in Kenya.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61592342871606" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
                <FiFacebook size={20} />
              </a>
              <a href="https://www.tiktok.com/@movec.connect" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
                <FaTiktok size={20} />
              </a>
              <a href="https://www.instagram.com/movecconnect/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
                <FiInstagram size={20} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition">
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
                <Link to="/modules/cctv" className="text-gray-700 hover:text-blue-600 transition">CCTV Systems</Link>
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
                <a
                  href="https://www.google.com/maps/search/?api=1&query=SMK+Business+Centre,+Nairobi,+Kenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-700 hover:text-blue-600 transition group"
                  title="Open location in Google Maps"
                >
                  <FiMapPin className="text-gray-400 group-hover:text-blue-600 mt-1 flex-shrink-0 transition-colors" size={18} />
                  <span>SMK Business Center, Nairobi, Kenya</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-gray-400 flex-shrink-0" size={18} />
                <a href="tel:+254727572310" className="text-gray-700 hover:text-blue-600 transition">
                  +254 727572310
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-gray-400 flex-shrink-0" size={18} />
                <a href="mailto:info@movec.co.ke" className="text-gray-700 hover:text-blue-600 transition">
                  info@movec.co.ke
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
              &copy; {new Date().getFullYear()} Movec Store. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition">Terms of Service</Link>
              <Link to="/refund" className="text-gray-600 hover:text-blue-600 transition">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}