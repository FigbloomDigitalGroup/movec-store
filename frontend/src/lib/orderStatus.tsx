import { FiClock, FiCheckCircle, FiRefreshCw, FiTruck, FiXCircle, FiAlertCircle } from 'react-icons/fi';

export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

interface OrderStatusConfigEntry {
  label: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
  icon: React.ReactNode;
}

// Single source of truth for order-status colors/labels/icons — imported by every
// page that renders an order status (customer Orders/OrderDetail, admin Orders) so
// the same status can never render in a different color on different screens.
const ORDER_STATUS_CONFIG: Record<string, OrderStatusConfigEntry> = {
  PENDING: { label: 'Pending', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400', icon: <FiClock size={14} /> },
  CONFIRMED: { label: 'Confirmed', text: 'text-[#10B982]', bg: 'bg-[#ecfdf5]', border: 'border-[#10B982]/20', dot: 'bg-[#10B982]', icon: <FiCheckCircle size={14} /> },
  PROCESSING: { label: 'Processing', text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-400', icon: <FiRefreshCw size={14} /> },
  SHIPPED: { label: 'Shipped', text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', dot: 'bg-sky-400', icon: <FiTruck size={14} /> },
  DELIVERED: { label: 'Delivered', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400', icon: <FiCheckCircle size={14} /> },
  CANCELLED: { label: 'Cancelled', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-400', icon: <FiXCircle size={14} /> },
};

const FALLBACK_CONFIG: OrderStatusConfigEntry = {
  label: 'Unknown', text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', dot: 'bg-gray-400', icon: <FiAlertCircle size={14} />,
};

export function getOrderStatusConfig(status: string): OrderStatusConfigEntry {
  return ORDER_STATUS_CONFIG[status] || { ...FALLBACK_CONFIG, label: status };
}
