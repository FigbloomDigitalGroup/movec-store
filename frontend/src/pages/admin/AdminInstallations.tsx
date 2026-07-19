import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

export default function AdminInstallations() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-installations'],
    queryFn: () => api.get('/admin/installation/requests').then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/admin/installation/requests/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-installations'] }),
  });

  const statuses = ['PENDING', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Installation Requests</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Service</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((req: any) => (
              <tr key={req.id} className="border-t">
                <td className="p-4">{req.user?.firstName} {req.user?.lastName}</td>
                <td className="p-4">{req.service?.name}</td>
                <td className="p-4">{new Date(req.preferredDate).toLocaleDateString()}</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{req.status}</span></td>
                <td className="p-4">
                  <select value={req.status} onChange={e => updateStatus.mutate({ id: req.id, status: e.target.value })} className="border rounded px-2 py-1 text-sm">
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