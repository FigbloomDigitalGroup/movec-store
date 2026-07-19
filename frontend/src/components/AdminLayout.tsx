import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiGrid, FiBox, FiShoppingCart, FiUsers, FiPackage,
  FiTool, FiMessageSquare, FiBarChart2, FiStar,
  FiBell, FiMenu, FiX, FiLogOut, FiHome
} from 'react-icons/fi';

const sidebarLinks = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard' },
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

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-sm text-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <Link to="/admin" className="text-xl font-bold text-blue-400">Admin Panel</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><FiX size={20} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${location.pathname === link.to ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg mb-1">
            <FiHome size={20} /><span>Back to Site</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-gray-800 rounded-lg w-full">
            <FiLogOut size={20} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2"><FiMenu size={24} /></button>
            <div className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName} <span className="text-blue-600">({user?.roles?.join(', ')})</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}