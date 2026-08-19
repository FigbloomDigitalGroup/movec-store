import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiTool,
  FiMoreHorizontal,
  FiDownload,
  FiCalendar,
  FiPackage,
  FiChevronDown,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const INSTALLATION_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500',
  APPROVED: 'bg-sky-500',
  SCHEDULED: 'bg-purple-500',
  IN_PROGRESS: 'bg-indigo-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
};

export default function AdminReports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exportOpen, setExportOpen] = useState(false);

  const dateParams = { from: from || undefined, to: to || undefined };

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['report-sales', from, to],
    queryFn: () => api.get('/admin/reports/sales', { params: dateParams }).then((r) => r.data),
  });

  const { data: customers, isLoading: custLoading } = useQuery({
    queryKey: ['report-customers', from, to],
    queryFn: () => api.get('/admin/reports/customers', { params: dateParams }).then((r) => r.data),
  });

  const { data: products, isLoading: prodLoading } = useQuery({
    queryKey: ['report-products', from, to],
    queryFn: () => api.get('/admin/reports/products', { params: dateParams }).then((r) => r.data),
  });

  const { data: installations, isLoading: instLoading } = useQuery({
    queryKey: ['report-installations', from, to],
    queryFn: () => api.get('/admin/reports/installations', { params: dateParams }).then((r) => r.data),
  });

  const downloadReport = async (type: string, format: string) => {
    const toastId = toast.loading(`Preparing ${type} export...`);
    try {
      const res = await api.get('/admin/reports/export', {
        params: { type, format, ...dateParams },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type.toUpperCase()} ${format.toUpperCase()} downloaded!`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to export report.', { id: toastId });
    }
  };

  const paymentMethodEntries: [string, number][] = sales?.paymentMethods
    ? Object.entries(sales.paymentMethods)
    : [];
  const paymentMethodTotal = paymentMethodEntries.reduce((sum, [, count]) => sum + count, 0);

  const installationStatusEntries: { status: string; count: number }[] = installations?.byStatus || [];
  const installationStatusTotal = installationStatusEntries.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="w-full space-y-6 pb-12 font-sans bg-[#f7f9fa] p-2 md:p-6 rounded-3xl border border-gray-200/60 shadow-sm">
      {/* Top Welcome & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            An overview of sales, customers, products, and installation activity.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Filter Inputs */}
          <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-700">
            <FiCalendar className="text-gray-400" size={14} />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-gray-800"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-gray-800"
            />
            {(from || to) && (
              <button
                onClick={() => { setFrom(''); setTo(''); }}
                className="text-[10px] text-red-500 hover:text-red-700 font-bold ml-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Export Report Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-2 bg-white text-gray-800 border border-gray-200 hover:border-gray-300 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition"
            >
              <FiDownload size={14} className="text-gray-600" />
              Export Report
              <FiChevronDown size={14} className="text-gray-400" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 p-2 text-xs space-y-1">
                <div className="px-3 py-1.5 font-bold text-gray-400 uppercase text-[10px] border-b border-gray-100">
                  Select Report to Download
                </div>
                {[
                  { label: 'Sales Report (CSV)', type: 'sales', format: 'csv' },
                  { label: 'Sales Report (PDF)', type: 'sales', format: 'pdf' },
                  { label: 'Products Report (CSV)', type: 'products', format: 'csv' },
                  { label: 'Customers Report (CSV)', type: 'customers', format: 'csv' },
                  { label: 'Installations (PDF)', type: 'installations', format: 'pdf' },
                  { label: 'Inventory (CSV)', type: 'inventory', format: 'csv' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      downloadReport(item.type, item.format);
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-xl transition flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <FiDownload size={12} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards Grid — every value below comes straight from the report queries, with no fabricated fallback */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Orders</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
              <FiTrendingUp size={14} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {salesLoading ? '—' : (sales?.totalOrders ?? 0).toLocaleString()}
          </h2>
          {!salesLoading && (
            <p className="text-xs text-gray-500 mt-2">Avg order: KES {(sales?.averageOrderValue ?? 0).toLocaleString()}</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Customers</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
              <FiUsers size={14} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {custLoading ? '—' : (customers?.totalCustomers ?? 0).toLocaleString()}
          </h2>
          {!custLoading && (
            <p className="text-xs text-gray-500 mt-2">+{customers?.newToday ?? 0} new today</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Revenue</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
              <FiDollarSign size={14} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {salesLoading ? '—' : `KES ${(sales?.totalSales ?? 0).toLocaleString()}`}
          </h2>
          <p className="text-xs text-gray-500 mt-2">Excludes cancelled orders</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Installation Requests</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
              <FiTool size={14} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {instLoading ? '—' : (installations?.totalRequests ?? 0).toLocaleString()}
          </h2>
          <p className="text-xs text-gray-500 mt-2">
            KES {(installations?.totalRevenue ?? 0).toLocaleString()} completed revenue
          </p>
        </motion.div>
      </div>

      {/* Middle Row: Payment Methods (real breakdown) + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Orders by Payment Method</h3>
              <p className="text-xs text-gray-400 mt-0.5">{paymentMethodTotal} orders in the selected period</p>
            </div>
            <button onClick={() => downloadReport('sales', 'csv')} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition">
              <FiMoreHorizontal size={18} />
            </button>
          </div>

          {salesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : paymentMethodEntries.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No orders in this period yet.</p>
          ) : (
            <div className="space-y-3">
              {paymentMethodEntries
                .sort((a, b) => b[1] - a[1])
                .map(([method, count]) => {
                  const pct = paymentMethodTotal > 0 ? Math.round((count / paymentMethodTotal) * 100) : 0;
                  return (
                    <div key={method}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-800">{method.replace(/_/g, ' ')}</span>
                        <span className="text-gray-500">{count} orders · {pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-[#10B982] h-2.5 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Top Products</h3>
              <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition">
                <FiMoreHorizontal size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {prodLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : products?.topSelling?.length > 0 ? (
                products.topSelling.slice(0, 5).map((prod: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-2xl transition border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center flex-shrink-0 text-gray-400">
                        <FiPackage size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate" title={prod.name}>
                          {prod.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{prod.totalSold} sold</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 flex-shrink-0 ml-2">
                      KES {(prod.price ?? 0).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 py-10 text-center">No sales recorded in this period yet.</p>
              )}
            </div>
          </div>

          <button onClick={() => downloadReport('products', 'csv')} className="mt-4 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition text-center">
            View Full Products Report
          </button>
        </motion.div>
      </div>

      {/* Bottom Row: Installation Status Breakdown (real) + Top Customers (real) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Installations by Status</h3>
              <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition">
                <FiMoreHorizontal size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">{installationStatusTotal} total requests</p>

            {instLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : installationStatusEntries.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No installation requests in this period yet.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {installationStatusEntries.map(({ status, count }) => {
                  const pct = installationStatusTotal > 0 ? Math.round((count / installationStatusTotal) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">{status.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-gray-900">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-1">
                        <div className={`h-2 rounded-full ${INSTALLATION_STATUS_COLORS[status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => downloadReport('installations', 'pdf')} className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition text-center">
            Download Installations Report
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Top Customers</h3>
                <p className="text-xs text-gray-400">Ranked by total spend in the selected period</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition">
                <FiMoreHorizontal size={18} />
              </button>
            </div>

            {custLoading ? (
              <div className="space-y-2.5">{[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : customers?.topCustomers?.length > 0 ? (
              <div className="space-y-2.5">
                {customers.topCustomers.slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#ecfdf5] text-[#10B982] flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {c.firstName?.[0]}{c.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{c.firstName} {c.lastName}</p>
                        <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-xs font-bold text-gray-900 block">KES {(c.totalSpent ?? 0).toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400">{c.ordersCount} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-10 text-center">No customer orders in this period yet.</p>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span>Showing top {Math.min(customers?.topCustomers?.length || 0, 6)} customers by spend</span>
            <button onClick={() => downloadReport('customers', 'csv')} className="text-[#10B982] font-bold hover:underline">
              Download Customers Report →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
