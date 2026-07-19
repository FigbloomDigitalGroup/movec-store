import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function AdminReports() {
  const { data: sales } = useQuery({ queryKey: ['report-sales'], queryFn: () => api.get('/admin/reports/sales').then(r => r.data) });
  const { data: inventory } = useQuery({ queryKey: ['report-inventory'], queryFn: () => api.get('/admin/reports/inventory').then(r => r.data) });
  const { data: customers } = useQuery({ queryKey: ['report-customers'], queryFn: () => api.get('/admin/reports/customers').then(r => r.data) });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Sales</h2>
          <p>Total Sales: KES {sales?.totalSales?.toLocaleString()}</p>
          <p>Total Orders: {sales?.totalOrders}</p>
          <p>Avg Order: KES {sales?.averageOrderValue?.toLocaleString()}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Inventory</h2>
          <p>Total Products: {inventory?.totalProducts}</p>
          <p>Total Stock: {inventory?.totalStock}</p>
          <p>Low Stock Items: {inventory?.lowStockCount}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Customers</h2>
          <p>Total: {customers?.totalCustomers}</p>
          <p>New Today: {customers?.newToday}</p>
        </div>
      </div>
    </div>
  );
}