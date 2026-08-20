import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPackage,
  FiSearch,
  FiChevronDown,
  FiX,
  FiMapPin,
  FiShoppingBag,
} from 'react-icons/fi';
import { ORDER_STATUSES, getOrderStatusConfig } from '../../lib/orderStatus';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import { TableContainer, TableHead, TableSkeletonRows, TableEmptyState } from '../../components/ui/Table';
import type { OrderItem } from '../../types';

const PAGE_SIZE = 20;

const STATUSES = ORDER_STATUSES;

const PAYMENT_CONFIG: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PENDING:   'bg-amber-50 text-amber-700',
  FAILED:    'bg-red-50 text-red-700',
  REFUNDED:  'bg-gray-100 text-gray-700',
};

// Shape returned by GET /admin/orders (OrdersService.findAll).
interface AdminOrderCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customer: AdminOrderCustomer | null;
  status: string;
  total: number;
  itemsCount: number;
  paymentStatus: string | null;
  createdAt: string;
}

interface AdminOrdersResponse {
  data: AdminOrderListItem[];
  meta: { page: number; limit: number; total: number };
}

// Shape returned by GET /admin/orders/:orderNumber (OrdersService.findByOrderNumber).
// shippingAddress is declared with the field names this modal actually reads —
// the real Address model uses line1/line2 and has no phone field, a pre-existing
// mismatch left untouched here since this pass only removes `any`, it doesn't
// change what renders.
interface AdminOrderDetailAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  phone?: string;
}

interface AdminOrderDetail {
  items: OrderItem[];
  shippingAddress?: AdminOrderDetailAddress | null;
}

/* ─── Update Status Modal ────────────────────────────────────── */
interface UpdateModalProps {
  order: AdminOrderListItem;
  onClose: () => void;
}

function UpdateStatusModal({ order, onClose }: UpdateModalProps) {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const queryClient = useQueryClient();

  const { data: orderDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-order', order.orderNumber],
    queryFn: () => api.get<AdminOrderDetail>(`/admin/orders/${order.orderNumber}`).then((r) => r.data),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Order #{order.orderNumber}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {order.customer?.firstName} {order.customer?.lastName} · {order.customer?.email}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-600 transition" aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        {/* Line items */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <FiShoppingBag size={12} /> Items
          </h4>
          {detailLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              {orderDetail?.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-gray-800">{item.productName} × {item.quantity}</span>
                  <span className="font-semibold text-gray-900">KES {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipping address */}
        {!detailLoading && orderDetail?.shippingAddress && (
          <div className="mb-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FiMapPin size={12} /> Delivery Address
            </h4>
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
              <p>{orderDetail.shippingAddress.addressLine1}</p>
              {orderDetail.shippingAddress.addressLine2 && <p>{orderDetail.shippingAddress.addressLine2}</p>}
              <p>{orderDetail.shippingAddress.city}{orderDetail.shippingAddress.state ? `, ${orderDetail.shippingAddress.state}` : ''}</p>
              {orderDetail.shippingAddress.phone && <p className="text-gray-500 mt-1">📞 {orderDetail.shippingAddress.phone}</p>}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">New Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => {
                const cfg = getOrderStatusConfig(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      status === s
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-offset-1 ring-primary-500/40`
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DHL1234567890"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-primary-500 transition"
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
              className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-sm"
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
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () =>
      api
        .get<AdminOrdersResponse>(`/admin/orders?limit=${PAGE_SIZE}&page=${page}${statusFilter ? `&status=${statusFilter}` : ''}`)
        .then((r) => r.data),
  });

  const orders: AdminOrderListItem[] = data?.data || [];
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

  // Real per-status counts across the WHOLE table, not just the current page — a
  // limit=1 request per status is enough since only meta.total is read from it.
  const { data: statusCounts } = useQuery({
    queryKey: ['admin-orders-status-counts'],
    queryFn: async () => {
      const results = await Promise.all(
        STATUSES.map((s) =>
          api.get(`/admin/orders?limit=1&status=${s}`).then((r) => ({ status: s, count: r.data?.meta?.total || 0 }))
        )
      );
      return results;
    },
  });

  const kpis = (statusCounts || []).filter((k) => k.count > 0);
  const grandTotal = (statusCounts || []).reduce((sum, k) => sum + k.count, 0);

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        icon={FiPackage}
        title="Orders Management"
        subtitle={`${grandTotal} total order${grandTotal !== 1 ? 's' : ''} — update status, track shipments, and manage fulfilment.`}
        action={
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search order # or customer..."
              aria-label="Search orders"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 transition"
            />
          </div>
        }
      />

      {/* KPI Status Pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
            !statusFilter
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Orders ({grandTotal})
        </button>
        {kpis.map(({ status, count }) => {
          const cfg = getOrderStatusConfig(status);
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                statusFilter === status
                  ? 'bg-primary-500 text-white border-primary-500'
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
      <TableContainer>
        <table className="w-full min-w-[700px]">
          <TableHead columns={['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', '']} />
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <TableSkeletonRows rows={5} columns={8} />
            ) : filtered.length === 0 ? (
              <TableEmptyState columns={8} icon={FiPackage} title="No orders found" description="Try adjusting your search or filter." />
            ) : (
              filtered.map((order) => (
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
                        <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {order.customer?.firstName?.[0]}{order.customer?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {order.customer?.firstName} {order.customer?.lastName}
                          </p>
                          <p className="text-[11px] text-gray-500">{order.customer?.email}</p>
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
                        <span className="text-[11px] text-gray-500">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.status} size="sm" />
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
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-700 transition px-3 py-1.5 rounded-lg hover:bg-primary-50"
                      >
                        Update <FiChevronDown size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))
            )}
          </tbody>
        </table>
      </TableContainer>
      {!isLoading && (
        <Pagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />
      )}

      {/* Update Status Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <UpdateStatusModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}