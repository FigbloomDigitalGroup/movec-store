import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useState } from 'react';

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => api.get(`/admin/orders?limit=100${statusFilter ? `&status=${statusFilter}` : ''}`).then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`px-3 py-1 rounded-full text-sm ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-sm ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Order #</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((order: any) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">{order.orderNumber}</td>
                <td className="p-4">{order.customer?.firstName} {order.customer?.lastName}</td>
                <td className="p-4">KES {order.total?.toLocaleString()}</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{order.status}</span></td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value })}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}