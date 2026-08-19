import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../lib/api';
import toast from 'react-hot-toast';
import {
  FiPackage,
  FiChevronLeft,
  FiAlertCircle,
  FiMapPin,
  FiTruck,
  FiCreditCard,
  FiTag,
  FiShoppingBag,
  FiArrowRight,
  FiXCircle,
} from 'react-icons/fi';
import { getOrderStatusConfig } from '../lib/orderStatus';
import OrderStatusBadge from '../components/OrderStatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useState } from 'react';

/* ─── Order Timeline ─────────────────────────────────────────── */
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function OrderTimeline({ status, history }: { status: string; history: any[] }) {
  const isCancelled = status === 'CANCELLED';
  const steps = isCancelled
    ? ['PENDING', 'CANCELLED']
    : STATUS_ORDER;

  const currentIdx = steps.indexOf(status);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-6">Order Progress</h3>
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {steps.map((step, i) => {
            const cfg = getOrderStatusConfig(step);
            const isDone = isCancelled
              ? (step === 'PENDING' || step === 'CANCELLED')
              : i <= currentIdx;
            const isActive = step === status;

            // Find matching history entry
            const histEntry = history.find((h) => h.status === step);

            return (
              <div key={step} className="relative flex items-start gap-4">
                {/* Dot */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                    isActive
                      ? `${cfg.bg} ${cfg.text} ring-4 ring-offset-1 ${cfg.bg}`
                      : isDone
                      ? `${cfg.bg} ${cfg.text}`
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {cfg.icon}
                </div>

                <div className="pt-1">
                  <p className={`text-sm font-semibold ${isActive ? cfg.text : isDone ? 'text-gray-800' : 'text-gray-400'}`}>
                    {cfg.label}
                  </p>
                  {histEntry ? (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(histEntry.changedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  ) : (
                    !isDone && <p className="text-xs text-gray-300 mt-0.5">Not yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const queryClient = useQueryClient();
  const [pendingCancel, setPendingCancel] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => api.get(`/orders/${orderNumber}`).then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/orders/${orderNumber}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderNumber] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled successfully.');
      setPendingCancel(false);
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <FiPackage size={40} className="animate-pulse text-gray-300" />
          <p className="text-sm">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">Order not found</h2>
          <Link to="/orders" className="text-primary-500 text-sm mt-2 inline-block hover:text-primary-600">← Back to orders</Link>
        </div>
      </div>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link
            to="/orders"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition mb-4"
          >
            <FiChevronLeft size={16} /> Back to Orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column (2/3) ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Items */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FiShoppingBag className="text-primary-500" size={16} /> Items Ordered
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-contain p-1" />
                      ) : (
                        <FiPackage className="text-gray-300" size={22} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.slug}`}
                        className="font-semibold text-gray-900 text-sm hover:text-primary-500 transition line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-sm">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">KES {item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FiMapPin className="text-primary-500" size={16} /> Delivery Address
                </h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-gray-500 pt-1">📞 {order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Tracking */}
            {order.shipping?.trackingNumber && (
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiTruck className="text-sky-600" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-sky-900">Shipment Tracking</h3>
                  <p className="text-xs text-sky-700 mt-0.5">
                    Carrier: <span className="font-semibold">{order.shipping.carrier || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-sky-700">
                    Tracking #: <span className="font-bold font-mono">{order.shipping.trackingNumber}</span>
                  </p>
                  {order.shipping.shippedAt && (
                    <p className="text-xs text-sky-600 mt-1">
                      Shipped: {new Date(order.shipping.shippedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Info */}
            {order.payments?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FiCreditCard className="text-primary-500" size={16} /> Payment
                </h2>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Method</span>
                  <span className="font-semibold text-gray-900">{order.payments[0].method}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${
                    order.payments[0].status === 'COMPLETED'
                      ? 'text-emerald-600'
                      : order.payments[0].status === 'FAILED'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  }`}>
                    {order.payments[0].status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Right column (1/3) ─────────────────────────── */}
          <div className="space-y-6">
            {/* Order Timeline */}
            <OrderTimeline status={order.status} history={order.statusHistory || []} />

            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>KES {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{order.shippingCost > 0 ? `KES ${order.shippingCost.toLocaleString()}` : 'Free'}</span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (VAT)</span>
                    <span>KES {order.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1"><FiTag size={13} /> Discount</span>
                    <span>-KES {order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {order.coupon && (
                  <div className="text-xs text-gray-400 text-right">
                    Coupon: <span className="font-mono font-semibold text-gray-600">{order.coupon.code}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-3">
                  Calculation: KES {order.subtotal.toLocaleString()} + KES {order.shippingCost.toLocaleString()}{order.taxAmount > 0 ? ` + KES ${order.taxAmount.toLocaleString()}` : ' + KES 0'}{order.discountAmount > 0 ? ` - KES ${order.discountAmount.toLocaleString()}` : ''} = KES {order.total.toLocaleString()}
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span>KES {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Pay Now for pending */}
              {order.status === 'PENDING' && (
                <Link
                  to={`/payment/${order.orderNumber}`}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition shadow-sm"
                >
                  <FiCreditCard size={16} /> Complete Payment
                </Link>
              )}

              {/* Cancel order */}
              {canCancel && (
                <button
                  onClick={() => setPendingCancel(true)}
                  disabled={cancelMutation.isPending}
                  className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  <FiXCircle size={15} />
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}

              {/* Continue shopping */}
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition"
              >
                Continue Shopping <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingCancel}
        title="Cancel this order?"
        description="This cannot be undone. You'll need to place a new order if you change your mind."
        confirmLabel="Cancel Order"
        isPending={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setPendingCancel(false)}
      />
    </div>
  );
}