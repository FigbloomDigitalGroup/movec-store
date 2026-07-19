import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function AdminSupport() {
  const { data } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => api.get('/admin/support/tickets').then(r => r.data),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Subject</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-4">{t.subject}</td>
                <td className="p-4">{t.user?.firstName} {t.user?.lastName}</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{t.status}</span></td>
                <td className="p-4">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}