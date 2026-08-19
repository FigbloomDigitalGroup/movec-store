import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { FiPackage } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';

export default function AdminInventory() {
  const queryClient = useQueryClient();
  const [stockForm, setStockForm] = useState({ productId: '', warehouseId: '', quantity: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => api.get('/admin/inventory').then(r => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => api.get('/admin/inventory/low-stock').then(r => r.data),
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products-picker'],
    queryFn: () => api.get('/admin/products?limit=200&sortBy=name&order=asc').then(r => r.data),
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.get('/admin/inventory/warehouses').then(r => r.data),
  });

  const products = productsData?.data || [];

  const stockIn = useMutation({
    mutationFn: (body: typeof stockForm) => api.post('/admin/inventory/stock-in', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      toast.success('Stock added');
      setStockForm({ productId: '', warehouseId: '', quantity: 0 });
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const canSubmit = stockForm.productId && stockForm.warehouseId && stockForm.quantity > 0;

  return (
    <div>
      <div className="mb-6">
        <PageHeader icon={FiPackage} title="Inventory" subtitle="Track stock levels and add new stock across warehouses." />
      </div>

      {lowStock?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <h2 className="font-semibold text-red-700 mb-2">Low Stock Alert</h2>
          {lowStock.map((item: any) => (
            <p key={item.id} className="text-sm text-red-600">{item.product?.name} - {item.quantity} remaining</p>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold mb-4 text-gray-900">Stock In</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={stockForm.productId}
            onChange={e => setStockForm({ ...stockForm, productId: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select product...</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
          <select
            value={stockForm.warehouseId}
            onChange={e => setStockForm({ ...stockForm, warehouseId: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select warehouse...</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}{w.location ? ` (${w.location})` : ''}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            placeholder="Quantity"
            value={stockForm.quantity || ''}
            onChange={e => setStockForm({ ...stockForm, quantity: Math.max(0, +e.target.value) })}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-32 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => stockIn.mutate(stockForm)}
            disabled={!canSubmit || stockIn.isPending}
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold text-sm transition whitespace-nowrap"
          >
            {stockIn.isPending ? 'Adding...' : 'Add Stock'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Product</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Warehouse</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Quantity</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Threshold</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="p-4" colSpan={4}><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : !data?.length ? (
              <tr>
                <td className="p-8 text-center text-gray-400 text-sm" colSpan={4}>No inventory records yet.</td>
              </tr>
            ) : (
              data?.map((item: any) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="p-4 text-sm text-gray-900">{item.product?.name}</td>
                  <td className="p-4 text-sm text-gray-600">{item.warehouse?.name}</td>
                  <td className="p-4 text-sm text-gray-900 font-semibold">{item.quantity}</td>
                  <td className="p-4 text-sm text-gray-500">{item.lowStockThreshold}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
