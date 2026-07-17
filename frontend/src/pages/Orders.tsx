import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function OrdersPage() {
  const { data } = useQuery({ queryKey: ['orders'], queryFn: () => api.get('/orders').then(r => r.data) });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {!data?.data?.length ? <p>No orders yet.</p> : data.data.map((order: any) => (
        <Link key={order.orderNumber} to={`/orders/${order.orderNumber}`} className="block bg-white rounded-xl shadow p-4 mb-4 hover:shadow-lg transition">
          <div className="flex justify-between">
            <span className="font-semibold">{order.orderNumber}</span>
            <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
          </div>
          <p className="text-lg font-bold mt-2">KES {order.total.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
        </Link>
      ))}
    </div>
  );
}