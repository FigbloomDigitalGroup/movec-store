import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { FiPackage, FiCheckCircle, FiAlertCircle, FiGrid, FiPlus, FiHome, FiUser, FiExternalLink, FiDollarSign, FiClock, FiTool, FiTrendingDown } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/reports/dashboard').then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories-stats'],
    queryFn: () => api.get('/admin/categories?limit=6').then(r => r.data),
  });

  const { data: recentProducts } = useQuery({
    queryKey: ['admin-recent-products', 'active', 'inStock'],
    queryFn: () => api.get('/admin/products?limit=5&sortBy=createdAt&order=desc&isActive=true&inStock=true').then(r => r.data),
  });

  if (isLoading) return <p className="text-center py-8">Loading dashboard...</p>;

  const quickActions = [
    { label: 'Add New Product', icon: FiPlus, action: () => navigate('/admin/products'), primary: true },
    { label: 'Edit Homepage', icon: FiHome, action: () => navigate('/admin/homepage'), primary: false },
    { label: 'Edit Profile', icon: FiUser, action: () => navigate('/admin/profile'), primary: false },
    { label: 'View Live Store', icon: FiExternalLink, action: () => window.open('/', '_blank'), primary: false },
  ];

  return (
    <div>
      <div className="mb-6">
        <PageHeader icon={FiGrid} title="Dashboard" subtitle="Welcome back, Admin. Here's what's happening." />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <FiPackage className="text-gray-600" size={20} />
          </div>
          <p className="text-2xl font-bold mb-1">{dashboardData?.products?.total || 0}</p>
          <p className="text-sm text-gray-500">Total Products</p>
        </button>

        <button
          onClick={() => navigate('/admin/products')}
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <FiCheckCircle className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold mb-1">{dashboardData?.products?.inStock || 0}</p>
          <p className="text-sm text-gray-500">In Stock</p>
        </button>

        <button
          onClick={() => navigate('/admin/products')}
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <FiAlertCircle className="text-orange-600" size={20} />
          </div>
          <p className="text-2xl font-bold mb-1">{dashboardData?.products?.outOfStock || 0}</p>
          <p className="text-sm text-gray-500">Out of Stock</p>
        </button>

        <button
          onClick={() => navigate('/admin/categories')}
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <FiGrid className="text-gray-600" size={20} />
          </div>
          <p className="text-2xl font-bold mb-1">{dashboardData?.categories?.total || 0}</p>
          <p className="text-sm text-gray-500">Categories</p>
        </button>
      </div>

      {/* Business KPIs — these come from the same dashboard summary endpoint above,
          but were previously fetched and discarded without ever being rendered. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/reports')}
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
            <FiDollarSign className="text-emerald-600" size={20} />
          </div>
          <p className="text-2xl font-bold mb-1">KES {(dashboardData?.sales?.total || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </button>

        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <FiClock className="text-amber-600" size={20} />
          </div>
          <p className="text-2xl font-bold mb-1">{dashboardData?.pending?.orders || 0}</p>
          <p className="text-sm text-gray-500">Pending Orders</p>
        </button>

        <button
          onClick={() => navigate('/admin/installations')}
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
            <FiTool className="text-sky-600" size={20} />
          </div>
          <p className="text-2xl font-bold mb-1">{dashboardData?.pending?.installations || 0}</p>
          <p className="text-sm text-gray-500">Pending Installations</p>
        </button>

        <button
          onClick={() => navigate('/admin/inventory')}
          className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <FiTrendingDown className="text-red-600" size={20} />
          </div>
          <p className="text-2xl font-bold mb-1">{dashboardData?.inventory?.lowStock || 0}</p>
          <p className="text-sm text-gray-500">Low Stock Items</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products by Category */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Products by Category</h2>
              <button
                onClick={() => navigate('/admin/categories')}
                className="text-sm text-primary-500 hover:underline"
              >
                View all
              </button>
            </div>
            
            <div className="space-y-3">
              {categoriesData?.length > 0 ? (
                categoriesData.slice(0, 6).map((category: any) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition cursor-pointer"
                    onClick={() => navigate(`/admin/products?category=${category.slug}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiGrid className="text-gray-600" size={16} />
                      </div>
                      <span className="font-medium text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-primary-500 font-semibold">{category._count?.products || 0}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">No categories found</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
            
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                    action.primary
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <action.icon size={18} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Products */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recently Added Products</h2>
            <button
              onClick={() => navigate('/admin/products')}
              className="text-sm text-primary-500 hover:underline"
            >
              See all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts?.data?.map((product: any) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => navigate('/admin/products')}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FiPackage className="text-gray-400" size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {product.categories && product.categories.length > 0
                          ? product.categories[0].name
                          : 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">
                        KES {product.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {!recentProducts?.data?.length && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No products added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}