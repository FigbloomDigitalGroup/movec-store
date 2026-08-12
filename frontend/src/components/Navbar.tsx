import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useState } from 'react';
import logo from '../assets/logo.png';

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
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      {/* ── Apple-style Announcement Bar ── */}
      <div className="bg-gray-100 text-gray-900 text-xs">
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-8">
            <span className="font-medium">
              Free delivery on orders over KES 50,000 • Limited time offer
            </span>
            <div className="flex items-center gap-3">
              <Link
                to="/products"
                className="text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition"
              >
                Learn more <span className="text-accent">›</span>
              </Link>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-gray-200 rounded transition text-gray-600 hover:text-gray-900">
                  <FiChevronLeft size={14} />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded transition text-gray-600 hover:text-gray-900">
                  <FiChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Apple-style Main Navbar ── */}
      <nav className="bg-white border-b border-gray-200/50 sticky top-0 z-50 backdrop-blur-xl bg-white/95">
        <div className="w-full px-4">
          <div className="flex items-center justify-between gap-6 h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="Movec" className="h-7 w-auto object-contain" />
            </Link>

            {/* Centered Navigation Links */}
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link to="/solutions/starlink" className="text-sm text-gray-900 hover:text-accent transition font-medium">
                Starlink
              </Link>
              <Link to="/solutions/cctv" className="text-sm text-gray-900 hover:text-accent transition font-medium">
                CCTV
              </Link>
              <Link to="/products?category=networking" className="text-sm text-gray-900 hover:text-accent transition font-medium">
                Networking
              </Link>
              <Link to="/products?category=accessories" className="text-sm text-gray-900 hover:text-accent transition font-medium">
                Accessories
              </Link>
              <Link to="/installation" className="text-sm text-gray-900 hover:text-accent transition font-medium">
                Installation
              </Link>
              <Link to="/support/faqs" className="text-sm text-gray-900 hover:text-accent transition font-medium">
                Support
              </Link>
            </div>

            {/* Right Utility Icons */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={() => {/* Search modal could go here */}}
                className="p-1.5 text-gray-600 hover:text-accent transition"
                aria-label="Search"
              >
                <FiSearch size={18} />
              </button>
              
              <Link
                to="/cart"
                className="relative p-1.5 text-gray-600 hover:text-accent transition"
                aria-label="Cart"
              >
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="p-1.5 text-gray-600 hover:text-accent transition"
                  aria-label="Account"
                >
                  <FiUser size={18} />
                </button>
                {accountOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                    onMouseLeave={() => setAccountOpen(false)}
                  >
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent transition"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent transition"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent transition"
                        >
                          Wishlist
                        </Link>
                        {user?.roles?.includes('ADMIN') && (
                          <Link
                            to="/admin"
                            onClick={() => setAccountOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent transition"
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
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 transition"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent transition"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0071e3] transition"
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 text-gray-600 hover:text-accent transition"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {[
                { to: '/solutions/starlink', label: 'Starlink' },
                { to: '/solutions/cctv', label: 'CCTV' },
                { to: '/products?category=networking', label: 'Networking' },
                { to: '/products?category=accessories', label: 'Accessories' },
                { to: '/installation', label: 'Installation' },
                { to: '/support/faqs', label: 'Support' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="block py-3 px-3 text-gray-700 hover:text-[#0071e3] font-medium transition"
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center justify-between py-3 px-3 text-gray-700 hover:text-[#0071e3] font-medium transition">
                  <span>Cart</span>
                  {cartCount > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
                </Link>
                <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center justify-between py-3 px-3 text-gray-700 hover:text-[#0071e3] font-medium transition">
                  <span>Wishlist</span>
                  {wishlistCount > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{wishlistCount}</span>}
                </Link>
              </div>
              {isAuthenticated ? (
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                  <Link to="/profile" onClick={() => setOpen(false)} className="block py-3 px-3 text-gray-700 hover:text-[#0071e3] font-medium transition">Profile</Link>
                  <Link to="/orders" onClick={() => setOpen(false)} className="block py-3 px-3 text-gray-700 hover:text-[#0071e3] font-medium transition">My Orders</Link>
                  {user?.roles?.includes('ADMIN') && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="block py-3 px-3 text-gray-700 hover:text-[#0071e3] font-medium transition">Admin Panel</Link>
                  )}
                  <button onClick={() => { logout(); navigate('/'); setOpen(false); }} className="w-full text-left py-3 px-3 text-gray-700 hover:text-[#0071e3] font-medium transition">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="block w-full text-center py-3 text-gray-700 hover:text-[#0071e3] font-medium transition">Sign In</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block w-full text-center py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">Create Account</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
