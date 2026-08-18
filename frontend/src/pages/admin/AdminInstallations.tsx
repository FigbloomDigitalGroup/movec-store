import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { FiTool } from 'react-icons/fi';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-sky-100 text-sky-700',
  SCHEDULED: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminInstallations() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-installations'],
    queryFn: () => api.get('/admin/installation/requests').then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/admin/installation/requests/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-installations'] });
      toast.success('Status updated');
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const statuses = ['PENDING', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Installation Requests</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Service</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="p-4" colSpan={5}><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : !data?.length ? (
              <tr>
                <td className="p-12 text-center text-gray-400" colSpan={5}>
                  <FiTool size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold">No installation requests yet</p>
                </td>
              </tr>
            ) : (
              data.map((req: any) => (
                <tr key={req.id} className="border-t border-gray-100">
                  <td className="p-4 text-sm text-gray-900">{req.user?.firstName} {req.user?.lastName}</td>
                  <td className="p-4 text-sm text-gray-600">{req.service?.name}</td>
                  <td className="p-4 text-sm text-gray-600">{new Date(req.preferredDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-700'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={req.status}
                      disabled={updateStatus.isPending}
                      onChange={e => updateStatus.mutate({ id: req.id, status: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 disabled:opacity-50"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
