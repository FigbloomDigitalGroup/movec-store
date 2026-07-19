import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useState } from 'react';

export default function AdminInventory() {
  const queryClient = useQueryClient();
  const [stockForm, setStockForm] = useState({ productId: '', warehouseId: '', quantity: 0 });

  const { data } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => api.get('/admin/inventory').then(r => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => api.get('/admin/inventory/low-stock').then(r => r.data),
  });

  const stockIn = useMutation({
    mutationFn: (body: any) => api.post('/admin/inventory/stock-in', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-inventory'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>

      {lowStock?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-red-700 mb-2">Low Stock Alert</h2>
          {lowStock.map((item: any) => (
            <p key={item.id} className="text-sm text-red-600">{item.product?.name} - {item.quantity} remaining</p>
          ))}
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Stock In</h2>
        <div className="flex gap-4">
          <input placeholder="Product ID" value={stockForm.productId} onChange={e => setStockForm({ ...stockForm, productId: e.target.value })} className="border rounded-lg px-4 py-2 flex-1" />
          <input placeholder="Warehouse ID" value={stockForm.warehouseId} onChange={e => setStockForm({ ...stockForm, warehouseId: e.target.value })} className="border rounded-lg px-4 py-2 flex-1" />
          <input type="number" placeholder="Quantity" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: +e.target.value })} className="border rounded-lg px-4 py-2 w-32" />
          <button onClick={() => stockIn.mutate(stockForm)} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Add Stock</button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Warehouse</th>
              <th className="text-left p-4">Quantity</th>
              <th className="text-left p-4">Threshold</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: any) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.product?.name}</td>
                <td className="p-4">{item.warehouse?.name}</td>
                <td className="p-4">{item.quantity}</td>
                <td className="p-4">{item.lowStockThreshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}