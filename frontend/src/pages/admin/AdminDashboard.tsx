import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiTool, FiAlertTriangle } from 'react-icons/fi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/reports/dashboard').then(r => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) return <p>Loading...</p>;

  const stats = [
    { label: 'Total Sales', value: `KES ${(data.sales?.total || 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-green-600', bg: 'bg-green-100', link: '/admin/reports' },
    { label: 'Orders', value: data.sales?.orders || 0, icon: FiShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100', link: '/admin/orders' },
    { label: 'Customers', value: data.customers?.total || 0, icon: FiUsers, color: 'text-purple-600', bg: 'bg-purple-100', link: '/admin/users' },
    { label: 'Products', value: data.products?.total || 0, icon: FiPackage, color: 'text-orange-600', bg: 'bg-orange-100', link: '/admin/products' },
    { label: 'Pending Orders', value: data.pending?.orders || 0, icon: FiAlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', link: '/admin/orders' },
    { label: 'Installations', value: data.installations?.total || 0, icon: FiTool, color: 'text-pink-600', bg: 'bg-pink-100', link: '/admin/installations' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.link)}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition text-left w-full cursor-pointer"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}