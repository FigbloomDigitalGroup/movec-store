import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { FiPackage } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import { TableContainer, TableHead, TableSkeletonRows, TableEmptyState } from '../../components/ui/Table';
import Tooltip from '../../components/ui/Tooltip';
import type { Product } from '../../types';

// Shape returned by GET /admin/inventory and /admin/inventory/low-stock
// (InventoryService.findAll/lowStock, which both `include: { product: true, warehouse: true }`).
interface AdminInventoryItem {
  id: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  product?: { name: string } | null;
  warehouse?: { name: string } | null;
}

// Shape returned by GET /admin/inventory/warehouses (InventoryService.findWarehouses).
interface InventoryWarehouse {
  id: string;
  name: string;
  location?: string | null;
}

export default function AdminInventory() {
  const queryClient = useQueryClient();
  const [stockForm, setStockForm] = useState({ productId: '', warehouseId: '', quantity: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => api.get<AdminInventoryItem[]>('/admin/inventory').then(r => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => api.get<AdminInventoryItem[]>('/admin/inventory/low-stock').then(r => r.data),
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products-picker'],
    queryFn: () => api.get<{ data: Product[] }>('/admin/products?limit=200&sortBy=name&order=asc').then(r => r.data),
  });

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.get<InventoryWarehouse[]>('/admin/inventory/warehouses').then(r => r.data),
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
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const canSubmit = stockForm.productId && stockForm.warehouseId && stockForm.quantity > 0;

  return (
    <div>
      <div className="mb-6">
        <PageHeader icon={FiPackage} title="Inventory" subtitle="Track stock levels and add new stock across warehouses." />
      </div>

      {lowStock && lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <h2 className="font-semibold text-red-700 mb-2">Low Stock Alert</h2>
          {lowStock.map((item) => (
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
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
          <select
            value={stockForm.warehouseId}
            onChange={e => setStockForm({ ...stockForm, warehouseId: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select warehouse...</option>
            {warehouses?.map((w) => (
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

      <TableContainer>
        <table className="w-full min-w-[640px]">
          <TableHead
            columns={[
              'Product',
              'Warehouse',
              <span key="qty" className="inline-flex items-center gap-1.5">
                Quantity
                <Tooltip text="Total units physically in this warehouse, including any reserved for pending orders." />
              </span>,
              <span key="reserved" className="inline-flex items-center gap-1.5">
                Reserved
                <Tooltip text="Units held for orders that are placed but not yet fulfilled — not available to sell again." />
              </span>,
              <span key="threshold" className="inline-flex items-center gap-1.5">
                Threshold
                <Tooltip text="The Low Stock Alert above fires once Quantity falls at or below this number." />
              </span>,
            ]}
          />
          <tbody>
            {isLoading ? (
              <TableSkeletonRows rows={3} columns={5} />
            ) : !data?.length ? (
              <TableEmptyState columns={5} icon={FiPackage} title="No inventory records yet" />
            ) : (
              data?.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="p-4 text-sm text-gray-900">{item.product?.name}</td>
                  <td className="p-4 text-sm text-gray-600">{item.warehouse?.name}</td>
                  <td className="p-4 text-sm text-gray-900 font-semibold">{item.quantity}</td>
                  <td className="p-4 text-sm text-gray-600">{item.reservedQuantity ?? 0}</td>
                  <td className="p-4 text-sm text-gray-500">{item.lowStockThreshold}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableContainer>
    </div>
  );
}
