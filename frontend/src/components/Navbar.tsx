import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-blue-400">Starlink CCTV</Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="hover:text-blue-400 transition">Products</Link>
            <Link to="/categories" className="hover:text-blue-400 transition">Categories</Link>
            <Link to="/installation" className="hover:text-blue-400 transition">Installation</Link>
            <Link to="/support/faqs" className="hover:text-blue-400 transition">FAQs</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/cart" className="relative">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/wishlist" className="relative">
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders"><FiUser size={20} /></Link>
                {user?.roles?.includes('ADMIN') && (
                  <Link to="/admin" className="text-yellow-400 text-sm font-medium">Admin</Link>
                )}
                <button onClick={() => { logout(); navigate('/'); }} className="text-red-400"><FiLogOut size={18} /></button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-400">Login</Link>
                <Link to="/register" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition">Register</Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}><FiMenu size={24} /></button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link to="/products" onClick={() => setOpen(false)}>Products</Link>
            <Link to="/categories" onClick={() => setOpen(false)}>Categories</Link>
            <Link to="/installation" onClick={() => setOpen(false)}>Installation</Link>
            <Link to="/cart" onClick={() => setOpen(false)} className="relative">
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            <Link to="/wishlist" onClick={() => setOpen(false)} className="relative">
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" onClick={() => setOpen(false)}>Orders</Link>
                {user?.roles?.includes('ADMIN') && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
                <button onClick={() => { logout(); navigate('/'); setOpen(false); }} className="text-left text-red-400">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}