import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin, FiClock, FiRefreshCw, FiTruck, FiHeadphones, FiAward } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa6';
import { FaLock } from 'react-icons/fa';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#F3F5F2] border-t border-[#E3E8E5] mt-0">
      <div className="bg-white border-b border-[#E3E8E5] py-5">
        <div className="w-full px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              { icon: FiAward, title: '100% Genuine Products', subtitle: 'Quality you can trust' },
              { icon: FaLock, title: 'Secure Payments', subtitle: 'Safe & encrypted' },
              { icon: FiRefreshCw, title: 'Easy Returns', subtitle: 'Hassle-free returns' },
              { icon: FiTruck, title: 'Nationwide Delivery', subtitle: 'Fast delivery to your door' },
              { icon: FiHeadphones, title: '24/7 Customer Support', subtitle: 'We are always here' },
            ].map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-[#10B982]/10 flex items-center justify-center">
                  <Icon className="text-[#10B982]" size={18} />
                </div>
                <p className="font-semibold text-[#1A1F1B] text-xs">{title}</p>
                <p className="text-[#4B534D] text-[11px]">{subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Movec Store" className="h-10 w-auto object-contain" />
              <span className="text-sm font-bold text-[#1A1F1B] tracking-wide">Store</span>
            </div>
            <p className="text-[#3A423E] mb-4">
              Your trusted partner for Starlink internet, AI-powered CCTV security, networking equipment, and smart devices in Kenya.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=61592342871606" target="_blank" rel="noopener noreferrer" className="text-[#7B837D] hover:text-[#10B982] transition">
                <FiFacebook size={20} />
              </a>
              <a href="https://www.tiktok.com/@movec.connect" target="_blank" rel="noopener noreferrer" className="text-[#7B837D] hover:text-[#10B982] transition">
                <FaTiktok size={20} />
              </a>
              <a href="https://www.instagram.com/figbloomdigital/?hl=en" target="_blank" rel="noopener noreferrer" className="text-[#7B837D] hover:text-[#10B982] transition">
                <FiInstagram size={20} />
              </a>
              <a href="https://www.linkedin.com/company/135305554/admin/dashboard/" target="_blank" rel="noopener noreferrer" className="text-[#7B837D] hover:text-[#10B982] transition">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[#1A1F1B] font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-[#3A423E] hover:text-[#10B982] transition">Products</Link></li>
              <li><Link to="/solutions/starlink" className="text-[#3A423E] hover:text-[#10B982] transition">Starlink Kits</Link></li>
              <li><Link to="/solutions/cctv" className="text-[#3A423E] hover:text-[#10B982] transition">CCTV Systems</Link></li>
              <li><Link to="/installation" className="text-[#3A423E] hover:text-[#10B982] transition">Installation</Link></li>
              <li><Link to="/support/faqs" className="text-[#3A423E] hover:text-[#10B982] transition">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1A1F1B] font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-[#3A423E] hover:text-[#10B982] transition">Contact Us</Link></li>
              <li><Link to="/orders" className="text-[#3A423E] hover:text-[#10B982] transition">Track Order</Link></li>
              <li><Link to="/profile" className="text-[#3A423E] hover:text-[#10B982] transition">My Account</Link></li>
              <li><Link to="/wishlist" className="text-[#3A423E] hover:text-[#10B982] transition">Wishlist</Link></li>
              <li><Link to="/support/faqs" className="text-[#3A423E] hover:text-[#10B982] transition">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1A1F1B] font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <a href="https://www.google.com/maps/search/?api=1&query=SMK+Business+Centre,+Nairobi,+Kenya" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-[#3A423E] hover:text-[#10B982] transition group" title="Open location in Google Maps">
                  <FiMapPin className="text-[#9BA39C] group-hover:text-[#10B982] mt-1 flex-shrink-0 transition-colors" size={18} />
                  <span>SMK Business Center, Nairobi, Kenya</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-[#9BA39C] flex-shrink-0" size={18} />
                <a href="tel:+254796285718" className="text-[#3A423E] hover:text-[#10B982] transition">+254 796285718</a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-[#9BA39C] flex-shrink-0" size={18} />
                <a href="mailto:sales@movec.com" className="text-[#3A423E] hover:text-[#10B982] transition">sales@movec.com</a>
              </li>
              <li className="flex items-center gap-3">
                <FiClock className="text-[#9BA39C] flex-shrink-0" size={18} />
                <span className="text-[#3A423E]">Mon-Sat: 8AM - 6PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E3E8E5] mt-10 pt-6">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#86898B]">
            <span>Copyright &copy; {new Date().getFullYear()} Movec Store. All rights reserved.</span>
            <span className="hidden sm:inline">&nbsp;</span>
            <Link to="/privacy" className="hover:text-[#10B982] transition">Privacy Policy</Link>
            <span aria-hidden="true">|</span>
            <Link to="/terms" className="hover:text-[#10B982] transition">Terms of Service</Link>
            <span aria-hidden="true">|</span>
            <Link to="/refund" className="hover:text-[#10B982] transition">Refund Policy</Link>
            <span aria-hidden="true">|</span>
            <Link to="/cookies" className="hover:text-[#10B982] transition">Cookie Policy</Link>
          </div>
        </div>
      </div>

      
    </footer>
  );
}