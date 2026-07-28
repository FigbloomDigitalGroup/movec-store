import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import {
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiSearch,
  FiX,
  FiPhone,
  FiTruck,
  FiTool,
  FiShield,
  FiHeadphones,
  FiChevronDown,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useState } from 'react';
import logo from '../assets/logo.png';

const WHATSAPP_NUMBER = '254796285718';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const guestCartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const guestWishlistCount = useWishlistStore((s) => s.items.length);

  const { data: apiCart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: apiWishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then((r) => r.data),
    enabled: isAuthenticated,
  });

  const cartCount = isAuthenticated
    ? apiCart?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0
    : guestCartCount;
  const wishlistCount = isAuthenticated ? apiWishlist?.length || 0 : guestWishlistCount;

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="bg-[#fc6501] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9">
            {/* Left badges */}
            <div className="hidden md:flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <FiTruck size={13} />
                Nationwide Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <FiTool size={13} />
                Professional Installation
              </span>
              <span className="flex items-center gap-1.5">
                <FiShield size={13} />
                1 Year Warranty
              </span>
              <span className="flex items-center gap-1.5">
                <FiHeadphones size={13} />
                24/7 Support
              </span>
            </div>

            {/* Mobile — single tagline */}
            <span className="md:hidden flex items-center gap-1.5">
              <FiTruck size={13} />
              Nationwide Delivery · Professional Installation
            </span>

            {/* Right — phone / WhatsApp CTA */}
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="flex items-center gap-2 font-semibold hover:text-white/80 transition"
            >
              <FiPhone size={13} />
              <span className="hidden sm:inline text-xs">Call or WhatsApp</span>
              <span className="font-bold tracking-wide">0796285718</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="Movec" className="h-10 w-auto object-contain" />
              <span className="text-sm font-bold text-gray-800 tracking-wide">Store</span>
            </Link>

            {/* Search bar — desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-xl relative"
            >
              <input
                type="text"
                placeholder="Search for Starlink, CCTV, Accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-24 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10b982] focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-5 bg-[#fc6501] hover:bg-[#db5300] text-white rounded-r-lg font-semibold text-sm transition flex items-center gap-1.5"
              >
                <FiSearch size={15} />
                <span>Search</span>
              </button>
            </form>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-1 ml-auto">
              {/* Account */}
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex flex-col items-center px-3 py-1.5 text-gray-700 hover:text-[#10b982] transition group"
                >
                  <FiUser size={18} />
                  <span className="text-xs mt-0.5 font-medium">
                    {isAuthenticated ? user?.firstName || 'Account' : 'Account'}
                  </span>
                </button>
                {accountOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    onMouseLeave={() => setAccountOpen(false)}
                  >
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#10b982]"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#10b982]"
                        >
                          My Orders
                        </Link>
                        {user?.roles?.includes('ADMIN') && (
                          <Link
                            to="/admin"
                            onClick={() => setAccountOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#10b982]"
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            navigate('/');
                            setAccountOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 border-t border-gray-100"
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#10b982]"
                        >
                          Log in
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#10b982]"
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative flex flex-col items-center px-3 py-1.5 text-gray-700 hover:text-[#10b982] transition"
              >
                <FiHeart size={18} />
                <span className="text-xs mt-0.5 font-medium">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-1 bg-[#fc6501] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex flex-col items-center px-3 py-1.5 text-gray-700 hover:text-[#10b982] transition"
              >
                <FiShoppingCart size={18} />
                <span className="text-xs mt-0.5 font-medium">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#fc6501] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile buttons */}
            <div className="flex md:hidden items-center gap-2 ml-auto">
              <Link to="/cart" className="relative p-2 text-gray-700">
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#fc6501] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setOpen(!open)}
              >
                {open ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Secondary Nav (category links) ── */}
        <div className="hidden md:block border-t border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-0 h-10 text-sm">
              <Link
                to="/categories"
                className="flex items-center gap-1.5 px-4 h-full bg-[#10b982] text-white font-semibold hover:bg-[#0ca072] transition"
              >
                <FiMenu size={15} />
                All Categories
                <FiChevronDown size={13} />
              </Link>
              <Link to="/solutions/starlink" className="px-4 h-full flex items-center text-gray-700 hover:text-[#10b982] font-medium transition border-r border-gray-200">
                Starlink Kits
              </Link>
              <Link to="/solutions/cctv" className="px-4 h-full flex items-center text-gray-700 hover:text-[#10b982] font-medium transition border-r border-gray-200">
                CCTV Cameras
              </Link>
              <Link to="/products?category=networking" className="px-4 h-full flex items-center text-gray-700 hover:text-[#10b982] font-medium transition border-r border-gray-200">
                Networking
              </Link>
              <Link to="/products?category=accessories" className="px-4 h-full flex items-center text-gray-700 hover:text-[#10b982] font-medium transition border-r border-gray-200">
                Accessories
              </Link>
              <Link to="/installation" className="px-4 h-full flex items-center text-gray-700 hover:text-[#10b982] font-medium transition border-r border-gray-200">
                Installation
              </Link>
              <Link to="/support/faqs" className="px-4 h-full flex items-center text-gray-700 hover:text-[#10b982] font-medium transition border-r border-gray-200">
                Support
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 mx-2 my-auto bg-[#25d366] hover:bg-[#1ebe57] text-white font-semibold text-xs rounded-full transition shadow-sm"
              >
                <FaWhatsapp size={15} />
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 py-2 bg-gray-50 border-t border-gray-100">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-20 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10b982]"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 bg-[#fc6501] text-white rounded-r-lg font-semibold text-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {[
                { to: '/solutions/starlink', label: 'Starlink Kits' },
                { to: '/solutions/cctv', label: 'CCTV Cameras' },
                { to: '/products?category=networking', label: 'Networking' },
                { to: '/products?category=accessories', label: 'Accessories' },
                { to: '/installation', label: 'Installation' },
                { to: '/support/faqs', label: 'Support / FAQs' },
                { to: '/contact', label: 'Contact Us' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#10b982] font-medium"
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center justify-between py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#10b982] font-medium">
                  <span>Wishlist</span>
                  {wishlistCount > 0 && <span className="bg-[#fc6501] text-white text-xs px-2 py-0.5 rounded-full">{wishlistCount}</span>}
                </Link>
              </div>
              {isAuthenticated ? (
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                  <Link to="/profile" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Profile</Link>
                  <Link to="/orders" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">My Orders</Link>
                  {user?.roles?.includes('ADMIN') && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Admin Panel</Link>
                  )}
                  <button onClick={() => { logout(); navigate('/'); setOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 font-medium">
                    Log out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="block w-full text-center py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:border-[#10b982] hover:text-[#10b982]">Log in</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block w-full text-center py-2.5 bg-[#10b982] text-white font-medium rounded-lg hover:bg-[#0ca072]">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
