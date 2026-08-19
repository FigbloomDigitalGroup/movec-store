import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  FiPackage,
  FiChevronRight,
  FiClock,
  FiShoppingBag,
  FiSearch,
} from 'react-icons/fi';
import { ORDER_STATUSES, getOrderStatusConfig } from '../lib/orderStatus';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((r) => r.data),
  });

  const orders: any[] = data?.data || [];

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch =
      search === '' ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.items?.some((i: any) => i.productName.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <FiPackage className="text-primary-500" size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-section-title text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-500 text-sm ml-14">
            Track and manage all your purchases in one place.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search by order number or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                statusFilter === 'all'
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              All ({orders.length})
            </button>
            {ORDER_STATUSES.map((s) => {
              const count = orders.filter((o) => o.status === s).length;
              if (count === 0) return null;
              const cfg = getOrderStatusConfig(s);
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                    statusFilter === s
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <FiShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No orders match your filter'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {orders.length === 0
                ? 'Once you place an order, it will appear here.'
                : 'Try adjusting your search or filter.'}
            </p>
            {orders.length === 0 && (
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
              >
                <FiShoppingBag size={16} /> Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <Link
                key={order.orderNumber}
                to={`/orders/${order.orderNumber}`}
                className="block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-500/30 transition group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Order info */}
                  <div className="flex items-start gap-4">
                    {/* Product thumbnail or icon */}
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {order.items?.[0]?.image ? (
                        <img
                          src={order.items[0].image}
                          alt=""
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <FiPackage className="text-gray-500" size={22} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">#{order.orderNumber}</span>
                        <OrderStatusBadge status={order.status} size="sm" />
                      </div>

                      {/* Item names preview */}
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {order.items?.map((i: any) => `${i.productName} ×${i.quantity}`).join(', ')}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right: Price + arrow */}
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end pl-[72px] sm:pl-0">
                    <span className="text-lg font-bold text-gray-900">
                      KES {order.total.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-primary-500 font-semibold group-hover:gap-2 transition-all">
                      View Details <FiChevronRight size={14} />
                    </div>
                  </div>
                </div>

                {/* Pending payment prompt */}
                {order.status === 'PENDING' && (
                  <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between">
                    <p className="text-xs text-amber-700 flex items-center gap-1.5">
                      <FiClock size={13} /> Payment pending — complete your payment to confirm this order.
                    </p>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      Pay Now
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}