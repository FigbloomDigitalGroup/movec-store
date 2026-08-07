import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AdminReports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const dateParams = { from: from || undefined, to: to || undefined };

  const { data: sales, isLoading: salesLoading } = useQuery({ 
    queryKey: ['report-sales', from, to], 
    queryFn: () => api.get('/admin/reports/sales', { params: dateParams }).then(r => r.data) 
  });
  const { data: inventory, isLoading: invLoading } = useQuery({ 
    queryKey: ['report-inventory'], 
    queryFn: () => api.get('/admin/reports/inventory').then(r => r.data) 
  });
  const { data: customers, isLoading: custLoading } = useQuery({ 
    queryKey: ['report-customers', from, to], 
    queryFn: () => api.get('/admin/reports/customers', { params: dateParams }).then(r => r.data) 
  });
  const { data: products, isLoading: prodLoading } = useQuery({ 
    queryKey: ['report-products', from, to], 
    queryFn: () => api.get('/admin/reports/products', { params: dateParams }).then(r => r.data) 
  });
  const { data: installations, isLoading: instLoading } = useQuery({ 
    queryKey: ['report-installations', from, to], 
    queryFn: () => api.get('/admin/reports/installations', { params: dateParams }).then(r => r.data) 
  });

  const downloadReport = async (type: string, format: string) => {
    const toastId = toast.loading(`Preparing ${type} export...`);
    try {
      const res = await api.get('/admin/reports/export', {
        params: { type, format, ...dateParams },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export downloaded!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to export report.', { id: toastId });
    }
  };

  const ExportButtons = ({ type }: { type: string }) => (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => downloadReport(type, 'csv')} 
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="Download CSV"
      >
        <FiFileText size={18} />
      </button>
      <button 
        onClick={() => downloadReport(type, 'pdf')} 
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Download PDF"
      >
        <FiDownload size={18} />
      </button>
    </div>
  );

  const Skeleton = () => (
    <div className="animate-pulse space-y-4 mt-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <FiCalendar className="text-gray-400" />
          <input 
            type="date" 
            value={from} 
            onChange={(e) => setFrom(e.target.value)}
            className="text-sm border-none outline-none focus:ring-0 text-gray-700 bg-transparent"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="date" 
            value={to} 
            onChange={(e) => setTo(e.target.value)}
            className="text-sm border-none outline-none focus:ring-0 text-gray-700 bg-transparent"
          />
          {(from || to) && (
            <button 
              onClick={() => { setFrom(''); setTo(''); }}
              className="text-xs text-red-500 hover:text-red-700 ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
            <h2 className="font-semibold text-xl text-gray-800">Sales</h2>
            <ExportButtons type="sales" />
          </div>
          {salesLoading ? <Skeleton /> : (
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between"><span>Total Sales</span><span className="font-medium text-gray-900">KES {sales?.totalSales?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Total Orders</span><span className="font-medium text-gray-900">{sales?.totalOrders}</span></div>
              <div className="flex justify-between"><span>Avg Order Value</span><span className="font-medium text-gray-900">KES {sales?.averageOrderValue?.toLocaleString()}</span></div>
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-2">Payment Methods</p>
                {sales?.paymentMethods && Object.entries(sales.paymentMethods).map(([method, count]) => (
                  <div key={method} className="flex justify-between text-sm">
                    <span className="capitalize">{method.toLowerCase()}</span><span>{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Customers Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
            <h2 className="font-semibold text-xl text-gray-800">Customers</h2>
            <ExportButtons type="customers" />
          </div>
          {custLoading ? <Skeleton /> : (
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between"><span>Total Customers</span><span className="font-medium text-gray-900">{customers?.totalCustomers}</span></div>
              <div className="flex justify-between"><span>New Today</span><span className="font-medium text-gray-900">{customers?.newToday}</span></div>
              {customers?.topCustomers?.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm text-gray-500 mb-2">Top Customers (by spend)</p>
                  <div className="space-y-2">
                    {customers.topCustomers.slice(0, 3).map((c: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="truncate pr-2">{c.firstName} {c.lastName}</span>
                        <span className="font-medium">KES {c.totalSpent?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Top Products Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
            <h2 className="font-semibold text-xl text-gray-800">Top Products</h2>
            <ExportButtons type="products" />
          </div>
          {prodLoading ? <Skeleton /> : (
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between mb-2"><span>Total Products</span><span className="font-medium text-gray-900">{products?.totalProducts}</span></div>
              <p className="text-sm text-gray-500 mb-2">Top Selling</p>
              <div className="space-y-2">
                {products?.topSelling?.slice(0, 5).map((p: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm items-center">
                    <span className="truncate pr-2 flex-1" title={p.name}>{p.name}</span>
                    <span className="text-gray-400 w-12 text-right">{p.totalSold}x</span>
                    <span className="font-medium text-gray-900 w-24 text-right">KES {p.revenue?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Installations Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
            <h2 className="font-semibold text-xl text-gray-800">Installations</h2>
            <ExportButtons type="installations" />
          </div>
          {instLoading ? <Skeleton /> : (
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between"><span>Total Requests</span><span className="font-medium text-gray-900">{installations?.totalRequests}</span></div>
              <div className="flex justify-between"><span>Total Revenue</span><span className="font-medium text-green-600">KES {installations?.totalRevenue?.toLocaleString()}</span></div>
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-2">By Status</p>
                {installations?.byStatus?.map((s: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="capitalize">{s.status.toLowerCase()}</span>
                    <span className="font-medium text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Inventory Snapshot Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
            <div>
              <h2 className="font-semibold text-xl text-gray-800">Inventory Snapshot</h2>
              <p className="text-xs text-gray-400 mt-1">Live current stock (date filters do not apply)</p>
            </div>
            <ExportButtons type="inventory" />
          </div>
          {invLoading ? <Skeleton /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-600">
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-500 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{inventory?.totalProducts}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-500 mb-1">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inventory?.totalStock}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-center">
                <p className="text-sm text-red-500 mb-1">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{inventory?.lowStockCount}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
