import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const { data: order } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => api.get(`/orders/${orderNumber}`).then(r => r.data),
  });

  if (!order) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Order {order.orderNumber}</h1>
      <p className="text-gray-500 mb-6">{new Date(order.createdAt).toLocaleDateString()}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 flex justify-between">
              <span>{item.productName} x {item.quantity}</span>
              <span className="font-semibold">KES {item.price.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow p-6 h-fit">
          <div className="flex justify-between py-2"><span>Subtotal</span><span>KES {order.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between py-2"><span>Shipping</span><span>KES {order.shippingCost.toLocaleString()}</span></div>
          <div className="flex justify-between py-2"><span>Tax</span><span>KES {order.taxAmount.toLocaleString()}</span></div>
          {order.discountAmount > 0 && <div className="flex justify-between py-2 text-green-600"><span>Discount</span><span>-KES {order.discountAmount.toLocaleString()}</span></div>}
          <div className="flex justify-between font-bold text-lg pt-4 border-t"><span>Total</span><span>KES {order.total.toLocaleString()}</span></div>
          <div className="mt-4 pt-4 border-t">
            <p className="font-semibold mb-2">Status</p>
            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">{order.status}</span>
            {order.status === 'PENDING' && (
              <Link
                to={`/payment/${order.orderNumber}`}
                className="block text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition mt-4 font-semibold text-sm"
              >
                Pay Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}