import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage,
  FiSearch,
  FiChevronDown,
  FiX,
} from 'react-icons/fi';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:    { label: 'Pending',    color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400' },
  CONFIRMED:  { label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-400' },
  PROCESSING: { label: 'Processing', color: 'bg-purple-50 text-purple-700 border-purple-200',  dot: 'bg-purple-400' },
  SHIPPED:    { label: 'Shipped',    color: 'bg-sky-50 text-sky-700 border-sky-200',           dot: 'bg-sky-400' },
  DELIVERED:  { label: 'Delivered',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-400' },
};

const PAYMENT_CONFIG: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PENDING:   'bg-amber-50 text-amber-700',
  FAILED:    'bg-red-50 text-red-700',
  REFUNDED:  'bg-gray-100 text-gray-700',
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ─── Update Status Modal ────────────────────────────────────── */
interface UpdateModalProps {
  order: any;
  onClose: () => void;
}

function UpdateStatusModal({ order, onClose }: UpdateModalProps) {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch(`/admin/orders/${order.id}/status`, {
        status,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success(`Order #${order.orderNumber} updated to ${status}`);
      onClose();
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Update Order Status</h3>
            <p className="text-xs text-gray-500 mt-0.5">Order #{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">New Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      status === s
                        ? `${cfg.color} ring-2 ring-offset-1 ring-blue-400`
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tracking fields shown when SHIPPED */}
          {status === 'SHIPPED' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Carrier</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. DHL, FedEx, G4S"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DHL1234567890"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || status === order.status}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-sm"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Admin Orders Page ─────────────────────────────────── */
export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () =>
      api
        .get(`/admin/orders?limit=100${statusFilter ? `&status=${statusFilter}` : ''}`)
        .then((r) => r.data),
  });

  const orders: any[] = data?.data || [];
  const total: number = data?.meta?.total || 0;

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      `${o.customer?.firstName} ${o.customer?.lastName}`.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q)
    );
  });

  // KPI counts
  const kpis = STATUSES.map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  })).filter((k) => k.count > 0);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiPackage className="text-blue-600" /> Orders Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} total order{total !== 1 ? 's' : ''} — update status, track shipments, and manage fulfilment.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* KPI Status Pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
            !statusFilter
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Orders ({total})
        </button>
        {kpis.map(({ status, count }) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 items-center">
                <div className="h-10 w-10 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-base font-bold text-gray-800">No orders found</h3>
            <p className="text-gray-500 text-xs mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(
                    (h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/80 transition"
                  >
                    <td className="px-5 py-4">
                      <span className="font-bold text-sm text-gray-900">#{order.orderNumber}</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {order.customer?.firstName?.[0]}{order.customer?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {order.customer?.firstName} {order.customer?.lastName}
                          </p>
                          <p className="text-[11px] text-gray-400">{order.customer?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-gray-700">
                        {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        KES {order.total.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {order.paymentStatus ? (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${PAYMENT_CONFIG[order.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {order.paymentStatus}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-[11px] text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition px-3 py-1.5 rounded-lg hover:bg-blue-50"
                      >
                        Update <FiChevronDown size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <UpdateStatusModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}