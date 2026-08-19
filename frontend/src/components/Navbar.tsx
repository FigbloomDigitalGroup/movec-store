import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCart } from '../hooks/useCart';
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { useState } from 'react';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const guestCartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const guestWishlistCount = useWishlistStore((s) => s.items.length);

  const { data: apiCart } = useCart();

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
      <nav className="bg-white/95 border-b border-neutral-200 sticky top-0 z-50 backdrop-blur-xl">
        <div className="w-full px-4">
          <div className="flex items-center justify-between gap-6 h-14">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src={logo} alt="Movec" className="h-8 w-auto object-contain" />
            </Link>

            <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {[
                { to: '/shop', label: 'Shop' },
                { to: '/solutions/starlink', label: 'Starlink' },
                { to: '/solutions/cctv', label: 'CCTV' },
                { to: '/products?category=networking', label: 'Networking' },
                { to: '/products?category=accessories', label: 'Accessories' },
                { to: '/installation', label: 'Installation' },
                { to: '/support/faqs', label: 'Support' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-sm font-medium text-neutral-700 hover:text-accent transition">
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <button onClick={() => {}} className="p-1.5 text-neutral-600 hover:text-accent transition" aria-label="Search">
                <FiSearch size={18} />
              </button>

              <Link to="/cart" className="relative p-1.5 text-neutral-600 hover:text-accent transition" aria-label="Cart">
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button onClick={() => setAccountOpen(!accountOpen)} className="p-1.5 text-neutral-600 hover:text-accent transition" aria-label="Account">
                  <FiUser size={18} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-50" onMouseLeave={() => setAccountOpen(false)}>
                    {isAuthenticated ? (
                      <>
                        <Link to="/profile" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-accent transition">My Profile</Link>
                        <Link to="/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-accent transition">My Orders</Link>
                        <Link to="/wishlist" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-accent transition">Wishlist</Link>
                        {user?.roles?.includes('ADMIN') && (
                          <Link to="/admin" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-accent transition">Admin Panel</Link>
                        )}
                        <button onClick={() => { logout(); navigate('/'); setAccountOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 border-t border-neutral-100 transition">Sign Out</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-accent transition">Sign In</Link>
                        <Link to="/register" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-accent transition">Create Account</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button className="md:hidden p-1.5 text-neutral-600 hover:text-accent transition" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-200 flex-shrink-0">
          <img src={logo} alt="Movec" className="h-7 w-auto object-contain" />
          <button onClick={() => setOpen(false)} className="p-1.5 text-neutral-600 hover:text-accent transition" aria-label="Close menu">
            <FiX size={20} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-1">
          {[
            { to: '/shop', label: 'Shop' },
            { to: '/solutions/starlink', label: 'Starlink' },
            { to: '/solutions/cctv', label: 'CCTV' },
            { to: '/products?category=networking', label: 'Networking' },
            { to: '/products?category=accessories', label: 'Accessories' },
            { to: '/installation', label: 'Installation' },
            { to: '/support/faqs', label: 'Support' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="block py-3 px-3 text-neutral-700 hover:text-accent font-medium transition">{label}</Link>
          ))}

          <div className="border-t border-neutral-100 pt-3 mt-3 space-y-1">
            <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center justify-between py-3 px-3 text-neutral-700 hover:text-accent font-medium transition">
              <span>Cart</span>
              {cartCount > 0 && <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
            </Link>
            <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center justify-between py-3 px-3 text-neutral-700 hover:text-accent font-medium transition">
              <span>Wishlist</span>
              {wishlistCount > 0 && <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">{wishlistCount}</span>}
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="border-t border-neutral-100 pt-3 mt-3 space-y-1">
              <Link to="/profile" onClick={() => setOpen(false)} className="block py-3 px-3 text-neutral-700 hover:text-accent font-medium transition">Profile</Link>
              <Link to="/orders" onClick={() => setOpen(false)} className="block py-3 px-3 text-neutral-700 hover:text-accent font-medium transition">My Orders</Link>
              {user?.roles?.includes('ADMIN') && (
                <Link to="/admin" onClick={() => setOpen(false)} className="block py-3 px-3 text-neutral-700 hover:text-accent font-medium transition">Admin Panel</Link>
              )}
              <button onClick={() => { logout(); navigate('/'); setOpen(false); }} className="w-full text-left py-3 px-3 text-neutral-700 hover:text-accent font-medium transition">Sign Out</button>
            </div>
          ) : (
            <div className="border-t border-neutral-100 pt-3 mt-3 space-y-2">
              <Link to="/login" onClick={() => setOpen(false)} className="block w-full text-center py-3 text-neutral-700 hover:text-accent font-medium transition">Sign In</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block w-full text-center py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark transition">Create Account</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
