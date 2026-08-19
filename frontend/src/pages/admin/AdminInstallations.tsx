import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { FiTool } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import { TableContainer, TableHead, TableSkeletonRows, TableEmptyState } from '../../components/ui/Table';

const PAGE_SIZE = 20;

// Shape returned by GET /admin/installation/requests — only the fields this page renders.
interface InstallationRequestRow {
  id: string;
  status: string;
  preferredDate: string;
  user: { firstName: string; lastName: string };
  service: { name: string };
}

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
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-installations', page],
    queryFn: () => api.get(`/admin/installation/requests?page=${page}&limit=${PAGE_SIZE}`).then(r => r.data),
  });

  const requests: InstallationRequestRow[] = data?.data || [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/admin/installation/requests/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-installations'] });
      toast.success('Status updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const statuses = ['PENDING', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div>
      <div className="mb-6">
        <PageHeader icon={FiTool} title="Installation Requests" subtitle="Review and schedule customer installation requests." />
      </div>
      <TableContainer>
        <table className="w-full min-w-[640px]">
          <TableHead columns={['Customer', 'Service', 'Date', 'Status', 'Action']} />
          <tbody>
            {isLoading ? (
              <TableSkeletonRows rows={3} columns={5} />
            ) : !requests.length ? (
              <TableEmptyState columns={5} icon={FiTool} title="No installation requests yet" />
            ) : (
              requests.map((req) => (
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
      </TableContainer>
      <Pagination page={page} limit={PAGE_SIZE} total={data?.meta?.total || 0} onPageChange={setPage} />
    </div>
  );
}
