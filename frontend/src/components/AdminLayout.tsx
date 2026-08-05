import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiGrid, FiBox, FiShoppingCart, FiUsers, FiPackage,
  FiTool, FiMessageSquare, FiBarChart2, FiStar,
  FiBell, FiMenu, FiX, FiLogOut, FiExternalLink, FiLayers
} from 'react-icons/fi';

const sidebarLinks = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard' },
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
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link to="/admin" className="text-xl font-bold text-blue-400">Admin Panel</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <FiX size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === link.to
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <link.icon size={18} />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom user + sign out */}
        <div className="p-4 border-t border-gray-800">
          {/* User info */}
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.firstName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">Administrator</p>
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

      {/* Main content */}
      <div className="flex-1 min-h-screen flex flex-col">
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: mobile menu toggle */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-800">
              <FiMenu size={22} />
            </button>

            {/* Right: clock + View Site */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-gray-400 font-medium hidden sm:block">{time}</span>
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

        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}