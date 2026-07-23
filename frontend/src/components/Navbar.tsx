import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiMenu, FiSearch, FiX } from 'react-icons/fi';
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

  const cartCount = isAuthenticated ? (apiCart?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0) : guestCartCount;
  const wishlistCount = isAuthenticated ? (apiWishlist?.length || 0) : guestWishlistCount;

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 shrink-0 focus:outline-none">
              <span className="inline-flex h-9 w-[6.25rem] overflow-hidden">
                <img
                  src={logo}
                  alt="Movec"
                  className="h-full w-full object-cover object-center"
                />
              </span>
              <span className="font-hero-bold text-xl text-gray-900 tracking-tight leading-none">Store</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/modules" className="text-gray-700 hover:text-blue-600 font-navigation transition">Solutions</Link>
              <Link to="/products" className="text-gray-700 hover:text-blue-600 font-navigation transition">Products</Link>
              <Link to="/categories" className="text-gray-700 hover:text-blue-600 font-navigation transition">Categories</Link>
              <Link to="/installation" className="text-gray-700 hover:text-blue-600 font-navigation transition">Installation</Link>
              <Link to="/support/faqs" className="text-gray-700 hover:text-blue-600 font-navigation transition">FAQs</Link>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
              >
                <FiSearch size={20} />
              </button>
              
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition">
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition">
                <FiHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition">
                    <FiUser size={20} />
                  </Link>
                  {user?.roles?.includes('ADMIN') && (
                    <Link to="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-700">Admin</Link>
                  )}
                  <button 
                    onClick={() => { logout(); navigate('/'); }} 
                    className="p-2 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <FiLogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2">Log in</Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setOpen(!open)}
            >
              {open ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link to="/modules" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                Solutions
              </Link>
              <Link to="/products" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                Products
              </Link>
              <Link to="/categories" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                Categories
              </Link>
              <Link to="/installation" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                Installation
              </Link>
              <Link to="/support/faqs" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                FAQs
              </Link>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center justify-between py-2 text-gray-700 hover:text-blue-600 font-medium">
                  <span>Cart</span>
                  {cartCount > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{cartCount}</span>}
                </Link>
                <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center justify-between py-2 text-gray-700 hover:text-blue-600 font-medium">
                  <span>Wishlist</span>
                  {wishlistCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{wishlistCount}</span>}
                </Link>
              </div>
              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <Link to="/profile" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                    Profile
                  </Link>
                  {user?.roles?.includes('ADMIN') && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                      Admin
                    </Link>
                  )}
                  <button 
                    onClick={() => { logout(); navigate('/'); setOpen(false); }} 
                    className="w-full text-left py-2 text-red-600 hover:text-red-700 font-medium"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="block w-full text-center py-2 text-gray-700 hover:text-blue-600 font-medium border border-gray-300 rounded-lg">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block w-full text-center py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}