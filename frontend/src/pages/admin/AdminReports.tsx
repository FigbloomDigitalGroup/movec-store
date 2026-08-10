import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiRefreshCw,
  FiMoreHorizontal,
  FiArrowUpRight,
  FiArrowDownRight,
  FiDownload,
  FiCalendar,
  FiPackage,
  FiMapPin,
  FiChevronDown,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AdminReports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(7); // Default August
  const [selectedProductFilter, setSelectedProductFilter] = useState('All Products');
  const [selectedCountyFilter, setSelectedCountyFilter] = useState('Top Counties');

  const dateParams = { from: from || undefined, to: to || undefined };

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['report-sales', from, to],
    queryFn: () => api.get('/admin/reports/sales', { params: dateParams }).then((r) => r.data),
  });

  useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => api.get('/admin/reports/inventory').then((r) => r.data),
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

  // Mock month data for chart rendering (dynamic overlay)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = [
    { sales: 42000, revenue: 310000, heightPct: 40 },
    { sales: 48000, revenue: 360000, heightPct: 48 },
    { sales: 38000, revenue: 290000, heightPct: 35 },
    { sales: 55000, revenue: 420000, heightPct: 58 },
    { sales: 62000, revenue: 490000, heightPct: 68 },
    { sales: 58000, revenue: 440000, heightPct: 62 },
    { sales: 69000, revenue: 530000, heightPct: 75 },
    { sales: 73940, revenue: 637738, heightPct: 88 }, // Active
    { sales: 61000, revenue: 470000, heightPct: 65 },
    { sales: 52000, revenue: 390000, heightPct: 54 },
    { sales: 67000, revenue: 510000, heightPct: 72 },
    { sales: 79000, revenue: 610000, heightPct: 85 },
  ];

  // Counties regional breakdown data
  const countyData = [
    { county: 'Nairobi', revenue: 'KES 312,450', orders: 248, flagBg: 'bg-emerald-600', top: true },
    { county: 'Mombasa', revenue: 'KES 120,000', orders: 114, flagBg: 'bg-blue-600' },
    { county: 'Nakuru', revenue: 'KES 98,500', orders: 86, flagBg: 'bg-indigo-600' },
    { county: 'Kisumu', revenue: 'KES 74,200', orders: 62, flagBg: 'bg-purple-600' },
    { county: 'Eldoret', revenue: 'KES 65,800', orders: 51, flagBg: 'bg-orange-600' },
  ];

  const totalSalesVal = sales?.totalSales ? sales.totalSales : 98643.24;
  const totalOrdersVal = sales?.totalOrders ? sales.totalOrders : 12485;
  const totalCustomersVal = customers?.totalCustomers ? customers.totalCustomers : 4263;
  const pendingVal = installations?.totalRequests ? installations.totalRequests : 187;

  return (
    <div className="w-full space-y-6 pb-12 font-sans bg-[#f7f9fa] p-2 md:p-6 rounded-3xl border border-gray-200/60 shadow-sm">
      {/* Top Welcome & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-2">
            Welcome, Admin <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            An overview of customer insights, sales performance, and revenue analytics.
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

      {/* 4 KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Sales</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
              <FiTrendingUp size={14} />
            </div>
          </div>
          <div className="my-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {salesLoading ? '...' : totalOrdersVal.toLocaleString()}
            </h2>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              <FiArrowUpRight size={12} /> +3.1% vs Last Week
            </span>
            <button onClick={() => downloadReport('sales', 'csv')} className="text-gray-400 hover:text-gray-700 font-medium flex items-center gap-0.5 transition">
              View Details ↗
            </button>
          </div>
        </motion.div>

        {/* Card 2: Active Customers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Customers</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
              <FiUsers size={14} />
            </div>
          </div>
          <div className="my-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {custLoading ? '...' : totalCustomersVal.toLocaleString()}
            </h2>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              <FiArrowUpRight size={12} /> +1.8% New Customers
            </span>
            <button onClick={() => downloadReport('customers', 'csv')} className="text-gray-400 hover:text-gray-700 font-medium flex items-center gap-0.5 transition">
              View Details ↗
            </button>
          </div>
        </motion.div>

        {/* Card 3: Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Revenue</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
              <FiDollarSign size={14} />
            </div>
          </div>
          <div className="my-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {salesLoading ? '...' : `KES ${totalSalesVal.toLocaleString()}`}
            </h2>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              <FiArrowUpRight size={12} /> +2.4% vs Last Week
            </span>
            <button onClick={() => downloadReport('sales', 'pdf')} className="text-gray-400 hover:text-gray-700 font-medium flex items-center gap-0.5 transition">
              View Details ↗
            </button>
          </div>
        </motion.div>

        {/* Card 4: Refund / Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Refund / Pending</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
              <FiRefreshCw size={14} />
            </div>
          </div>
          <div className="my-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {instLoading ? '...' : pendingVal}
            </h2>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
              <FiArrowDownRight size={12} /> -0.6% vs Last Week
            </span>
            <button onClick={() => downloadReport('installations', 'pdf')} className="text-gray-400 hover:text-gray-700 font-medium flex items-center gap-0.5 transition">
              View Details ↗
            </button>
          </div>
        </motion.div>
      </div>

      {/* Middle Row: Total Profit Overview (Left) + Top Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Total Profit Overview Bar Chart (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-gray-900">Total Profit Overview</h3>
            <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition">
              <FiMoreHorizontal size={18} />
            </button>
          </div>

          {/* Big Amount & Badges Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                KES {totalSalesVal.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                +8.4% <FiArrowUpRight size={12} />
              </span>
            </div>

            {/* Platform / Module Badges */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-gray-900">Starlink</span> 206 Sales
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-semibold text-gray-900">CCTV</span> 400 Sales
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300" /> Total Sales
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fc6501]" /> Total Revenue
            </span>
          </div>

          {/* Monthly Bar Chart Area */}
          <div className="relative pt-6 pb-2">
            {/* Grid Y-axis background lines */}
            <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none border-b border-gray-100 text-[10px] text-gray-300">
              <div className="border-t border-dashed border-gray-100 flex justify-between"><span>100k</span></div>
              <div className="border-t border-dashed border-gray-100 flex justify-between"><span>80k</span></div>
              <div className="border-t border-dashed border-gray-100 flex justify-between"><span>60k</span></div>
              <div className="border-t border-dashed border-gray-100 flex justify-between"><span>40k</span></div>
              <div className="border-t border-dashed border-gray-100 flex justify-between"><span>20k</span></div>
              <div className="border-t border-gray-200 flex justify-between"><span>0k</span></div>
            </div>

            {/* Bars grid */}
            <div className="h-56 flex items-end justify-between gap-1 md:gap-2 px-2 relative z-10">
              {monthNames.map((month, idx) => {
                const data = monthlyData[idx];
                const isSelected = idx === selectedMonthIndex;

                return (
                  <div
                    key={month}
                    onClick={() => setSelectedMonthIndex(idx)}
                    className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end relative"
                  >
                    {/* Tooltip Popup on Selected / Active Bar */}
                    {isSelected && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-xl text-center z-20 whitespace-nowrap">
                        <p className="text-[10px] text-gray-400 font-medium">{month} 2026</p>
                        <p className="text-xs font-black text-gray-900">
                          {data.sales.toLocaleString()} / KES {data.revenue.toLocaleString()}
                        </p>
                        <div className="w-2 h-2 bg-white border-b border-r border-gray-200 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                      </div>
                    )}

                    {/* Bar Background Track */}
                    <div className="w-full max-w-[28px] bg-gray-100/70 hover:bg-gray-200 rounded-lg h-full flex items-end overflow-hidden transition-all p-0.5">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${data.heightPct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.03 }}
                        className={`w-full rounded-md transition-all ${
                          isSelected
                            ? 'bg-[#fc6501] shadow-lg shadow-orange-500/30'
                            : 'bg-gray-300 group-hover:bg-gray-400'
                        }`}
                      />
                    </div>

                    {/* X-axis Label */}
                    <span className={`text-[11px] mt-2 font-medium transition ${
                      isSelected ? 'text-gray-900 font-bold' : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                      {month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Top Products (4 cols) */}
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

            {/* List of Products */}
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
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {prod.totalSold} sold • Product
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-gray-900 flex-shrink-0 ml-2">
                      KES {prod.price ? prod.price.toLocaleString() : '180'}
                    </span>
                  </div>
                ))
              ) : (
                // Fallback elegant items matching the image style
                [
                  { name: 'Starlink Gen 3 Standard Kit', tag: 'Satellite Kit', price: 'KES 65,000' },
                  { name: 'Hikvision 4MP ColorVu Camera', tag: 'CCTV Security', price: 'KES 18,500' },
                  { name: 'Dahua 4K WDR Bullet Camera', tag: 'Security Camera', price: 'KES 24,900' },
                  { name: 'Seagate SkyHawk 2TB HDD', tag: 'Surveillance Storage', price: 'KES 12,000' },
                  { name: 'Starlink Ethernet Adapter', tag: 'Accessory', price: 'KES 8,500' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-2xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500">
                        <FiPackage size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {item.tag}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-gray-900 ml-2">
                      {item.price}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button onClick={() => downloadReport('products', 'csv')} className="mt-4 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition text-center">
            View Full Products Report
          </button>
        </motion.div>
      </div>

      {/* Bottom Row: Customer Orders (Left) + Sales by Counties (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Customer Orders (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">Customer Orders</h3>
              <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition">
                <FiMoreHorizontal size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">1 Jan - 31 Dec 2026</p>

            <div className="mb-6">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                {salesLoading ? '...' : (sales?.totalOrders ? (sales.totalOrders * 3.6).toFixed(0) : '45,637')}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  +9.4% <FiArrowUpRight size={12} />
                </span>
                <span className="text-xs font-semibold text-gray-500">+245 new today</span>
              </div>
            </div>

            {/* Fulfillment Status Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Completed Orders</span>
                <span className="font-bold text-gray-900">82%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-600 font-medium">Pending & In Transit</span>
                <span className="font-bold text-gray-900">18%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>
          </div>

          <button onClick={() => downloadReport('sales', 'pdf')} className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition text-center">
            Download Order Summary
          </button>
        </motion.div>

        {/* Right Column: Sales by Counties / Locations (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Sales by Counties</h3>
                <p className="text-xs text-gray-400">Keep track of all orders here</p>
              </div>

              {/* Filter Pills / Dropdowns */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 font-semibold focus:outline-none"
                >
                  <option>All Products</option>
                  <option>Starlink Kits</option>
                  <option>CCTV Systems</option>
                </select>

                <select
                  value={selectedCountyFilter}
                  onChange={(e) => setSelectedCountyFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 font-semibold focus:outline-none"
                >
                  <option>Top Counties</option>
                  <option>All 27 Counties</option>
                </select>
              </div>
            </div>

            {/* Regional Performance Grid & Location Pin Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
              {/* Top Performing County Box */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                    Top Performing County
                  </span>
                  <h4 className="text-xl font-black text-gray-900">Nairobi County</h4>
                  <p className="text-2xl font-black text-emerald-700 mt-1">KES 312,450</p>
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-3 flex items-center gap-1">
                  <FiMapPin size={14} /> 248 Total Delivered Orders
                </p>
              </div>

              {/* County breakdown list */}
              <div className="space-y-2.5">
                {countyData.slice(1).map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${c.flagBg}`} />
                      <span className="text-xs font-bold text-gray-800">{c.county}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900 block">{c.revenue}</span>
                      <span className="text-[10px] text-gray-400">{c.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span>Showing top 5 counties by sales volume</span>
            <button onClick={() => downloadReport('customers', 'csv')} className="text-emerald-600 font-bold hover:underline">
              Download Regional Report →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
