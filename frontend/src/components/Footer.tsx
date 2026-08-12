import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin, FiClock, FiRefreshCw, FiTruck, FiHeadphones, FiAward } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa6';
import { FaLock } from 'react-icons/fa';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-0">

      {/* ── Trust Bar ── */}
      <div className="bg-white border-b border-gray-200 py-5">
        <div className="w-full px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-[#10b982]/10 flex items-center justify-center">
                <FiAward className="text-[#10b982]" size={18} />
              </div>
              <p className="font-semibold text-gray-900 text-xs">100% Genuine Products</p>
              <p className="text-gray-500 text-[11px]">Quality you can trust</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-[#10b982]/10 flex items-center justify-center">
                <FaLock className="text-[#10b982]" size={16} />
              </div>
              <p className="font-semibold text-gray-900 text-xs">Secure Payments</p>
              <p className="text-gray-500 text-[11px]">Safe & encrypted</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-[#10b982]/10 flex items-center justify-center">
                <FiRefreshCw className="text-[#10b982]" size={18} />
              </div>
              <p className="font-semibold text-gray-900 text-xs">Easy Returns</p>
              <p className="text-gray-500 text-[11px]">Hassle-free returns</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-[#10b982]/10 flex items-center justify-center">
                <FiTruck className="text-[#10b982]" size={18} />
              </div>
              <p className="font-semibold text-gray-900 text-xs">Nationwide Delivery</p>
              <p className="text-gray-500 text-[11px]">Fast delivery to your door</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-full bg-[#10b982]/10 flex items-center justify-center">
                <FiHeadphones className="text-[#10b982]" size={18} />
              </div>
              <p className="font-semibold text-gray-900 text-xs">24/7 Customer Support</p>
              <p className="text-gray-500 text-[11px]">We are always here</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Movec Store" className="h-10 w-auto object-contain" />
              <span className="text-sm font-bold text-gray-800 tracking-wide">Store</span>
            </div>
            <p className="text-gray-700 mb-4">
              Your trusted partner for Starlink internet, AI-powered CCTV security, networking equipment, and smart devices in Kenya.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61592342871606" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#10b982] transition">
                <FiFacebook size={20} />
              </a>
              <a href="https://www.tiktok.com/@movec.connect" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#10b982] transition">
                <FaTiktok size={20} />
              </a>
              <a href="https://www.instagram.com/figbloomdigital/?hl=en" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#10b982] transition">
                <FiInstagram size={20} />
              </a>
              <a href="https://www.linkedin.com/company/135305554/admin/dashboard/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#10b982] transition">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-700 hover:text-[#10b982] transition">Products</Link>
              </li>
              <li>
                <Link to="/solutions/starlink" className="text-gray-700 hover:text-[#10b982] transition">Starlink Kits</Link>
              </li>
              <li>
                <Link to="/solutions/cctv" className="text-gray-700 hover:text-[#10b982] transition">CCTV Systems</Link>
              </li>
              <li>
                <Link to="/installation" className="text-gray-700 hover:text-[#10b982] transition">Installation</Link>
              </li>
              <li>
                <Link to="/support/faqs" className="text-gray-700 hover:text-[#10b982] transition">FAQs</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-700 hover:text-[#10b982] transition">Contact Us</Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-700 hover:text-[#10b982] transition">Track Order</Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-700 hover:text-[#10b982] transition">My Account</Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-700 hover:text-[#10b982] transition">Wishlist</Link>
              </li>
              <li>
                <Link to="/support/faqs" className="text-gray-700 hover:text-[#10b982] transition">Support</Link>
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
                  className="flex items-start gap-3 text-gray-700 hover:text-[#10b982] transition group"
                  title="Open location in Google Maps"
                >
                  <FiMapPin className="text-gray-400 group-hover:text-[#10b982] mt-1 flex-shrink-0 transition-colors" size={18} />
                  <span>SMK Business Center, Nairobi, Kenya</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-gray-400 flex-shrink-0" size={18} />
                <a href="tel:+254796285718" className="text-gray-700 hover:text-[#10b982] transition">
                  +254 796285718
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-gray-400 flex-shrink-0" size={18} />
                <a href="mailto:sales@movec.com" className="text-gray-700 hover:text-[#10b982] transition">
                  sales@movec.com
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
              <Link to="/privacy" className="text-gray-600 hover:text-[#10b982] transition">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-600 hover:text-[#10b982] transition">Terms of Service</Link>
              <Link to="/refund" className="text-gray-600 hover:text-[#10b982] transition">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pride Bar ── */}
      <div className="bg-[#10b982] py-3">
        <div className="w-full px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-white text-xs font-semibold">
            <span className="flex items-center gap-2">
              🇰🇪 Proudly Serving Kenya
            </span>
            <span className="flex items-center gap-2">
               Trusted by Thousands of Customers
            </span>
            <span className="flex items-center gap-2">
               Your Connectivity &amp; Security Partner
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}