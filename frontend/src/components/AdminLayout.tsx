import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiGrid, FiBox, FiShoppingCart, FiUsers, FiPackage,
  FiTool, FiMessageSquare, FiBarChart2, FiStar,
  FiBell, FiMenu, FiX, FiLogOut, FiExternalLink, FiLayers, FiHome, FiCreditCard
} from 'react-icons/fi';

const sidebarLinks = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/homepage', icon: FiHome, label: 'Edit Homepage' },
  { to: '/admin/modules', icon: FiLayers, label: 'Modules' },
  { to: '/admin/products', icon: FiBox, label: 'Products' },
  { to: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/inventory', icon: FiPackage, label: 'Inventory' },
  { to: '/admin/installations', icon: FiTool, label: 'Installations' },
  { to: '/admin/support', icon: FiMessageSquare, label: 'Support' },
  { to: '/admin/reports', icon: FiBarChart2, label: 'Reports' },
  { to: '/admin/reviews', icon: FiStar, label: 'Reviews' },
  { to: '/admin/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/admin/payment-settings', icon: FiCreditCard, label: 'Payment Settings' },
];

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const time = useClock();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 h-full bg-slate-950 flex flex-col flex-shrink-0 transform transition-transform border-r border-slate-800 shadow-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ color: '#cbd5e1' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <Link to="/admin" className="text-xl font-semibold tracking-tight text-primary-200">
            Admin Panel
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-100">
            <FiX size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Admin sidebar" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                location.pathname === link.to
                  ? 'bg-primary-500/15 text-primary-200 shadow-sm shadow-primary-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <link.icon size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom user + sign out */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex-shrink-0">
          {/* User info */}
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-slate-950 font-semibold text-sm shadow-lg shadow-primary-500/20 flex-shrink-0">
              {user?.firstName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>

          {/* Sign Out button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-red-700/60 bg-red-950/40 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-all text-sm font-medium"
          >
            <FiLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="bg-white border-b flex-shrink-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: mobile menu toggle */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-800">
              <FiMenu size={22} />
            </button>

            {/* Right: clock + View Site */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-gray-500 font-medium hidden sm:block">{time}</span>
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium"
              >
                <FiExternalLink size={14} />
                <span>View Site</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}