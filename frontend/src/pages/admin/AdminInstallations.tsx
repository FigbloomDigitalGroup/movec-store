import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTool, FiSearch, FiX, FiMapPin, FiCalendar, FiFileText, FiChevronDown } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import { TableContainer, TableHead, TableSkeletonRows, TableEmptyState } from '../../components/ui/Table';
import { formatTimeSlot } from '../../lib/installationTimeSlots';

const PAGE_SIZE = 20;

// Shape returned by GET /admin/installation/requests (InstallationService.getAllRequests) —
// the list endpoint already returns everything a detail view needs, so the modal below
// reads straight off this row instead of firing a second per-record fetch.
interface InstallationRequestRow {
  id: string;
  status: string;
  preferredDate: string;
  timeSlot: string | null;
  notes: string | null;
  finalPrice: number | string | null;
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null };
  service: { name: string; description: string | null; basePrice: number | string; durationMinutes: number };
  address: { line1: string; line2: string | null; city: string; state: string | null; postalCode: string; country: string };
  technicianAssignment: {
    assignedAt: string;
    completedAt: string | null;
    technician: { user: { firstName: string; lastName: string } };
  } | null;
}

const STATUSES = ['PENDING', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_BADGE_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-sky-100 text-sky-700',
  SCHEDULED: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_BUTTON_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  APPROVED: 'bg-sky-100 text-sky-700 border-sky-200',
  SCHEDULED: 'bg-purple-100 text-purple-700 border-purple-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

function formatMoney(amount: number | string | null) {
  if (amount === null || amount === undefined) return '—';
  return `KES ${Number(amount).toLocaleString()}`;
}

/* ─── Request Detail Modal ───────────────────────────────────── */
interface DetailModalProps {
  request: InstallationRequestRow;
  onClose: () => void;
}

function RequestDetailModal({ request, onClose }: DetailModalProps) {
  const [status, setStatus] = useState(request.status);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateStatus = useMutation({
    mutationFn: (newStatus: string) => api.patch(`/admin/installation/requests/${request.id}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-installations'] });
      toast.success('Status updated');
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const technicianName = request.technicianAssignment
    ? `${request.technicianAssignment.technician.user.firstName} ${request.technicianAssignment.technician.user.lastName}`
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {request.user.firstName} {request.user.lastName}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {request.user.email}{request.user.phone ? ` · ${request.user.phone}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-600 transition" aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        {/* Service & Schedule */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <FiCalendar size={12} /> Service &amp; Schedule
          </h4>
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span className="font-semibold text-gray-900">{request.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Preferred date</span>
              <span className="font-semibold text-gray-900">{new Date(request.preferredDate).toLocaleDateString()}</span>
            </div>
            {formatTimeSlot(request.timeSlot) && (
              <div className="flex justify-between">
                <span className="text-gray-500">Preferred time</span>
                <span className="font-semibold text-gray-900">{formatTimeSlot(request.timeSlot)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated price</span>
              <span className="font-semibold text-gray-900">{formatMoney(request.finalPrice)}</span>
            </div>
            {technicianName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Technician</span>
                <span className="font-semibold text-gray-900">{technicianName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Installation Address */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <FiMapPin size={12} /> Installation Address
          </h4>
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
            <p>{request.address.line1}</p>
            {request.address.line2 && <p>{request.address.line2}</p>}
            <p>{request.address.city}{request.address.state ? `, ${request.address.state}` : ''} {request.address.postalCode}</p>
            <p>{request.address.country}</p>
          </div>
        </div>

        {/* Customer Notes */}
        {request.notes && (
          <div className="mb-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FiFileText size={12} /> Customer Notes
            </h4>
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">{request.notes}</div>
          </div>
        )}

        {/* Status Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
                    status === s
                      ? `${STATUS_BUTTON_COLORS[s]} ring-2 ring-offset-1 ring-primary-500/40`
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={() => updateStatus.mutate(status)}
              disabled={updateStatus.isPending || status === request.status}
              className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-sm"
            >
              {updateStatus.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Admin Installations Page ──────────────────────────── */
export default function AdminInstallations() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<InstallationRequestRow | null>(null);

  // Debounce the search box so every keystroke doesn't fire its own request.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-installations', page, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (debouncedSearch) params.set('search', debouncedSearch);
      return api.get(`/admin/installation/requests?${params.toString()}`).then(r => r.data);
    },
  });

  const requests: InstallationRequestRow[] = data?.data || [];

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          icon={FiTool}
          title="Installation Requests"
          subtitle="Review and schedule customer installation requests."
          action={
            <div className="relative w-full md:w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search customer or service..."
                aria-label="Search installation requests"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 transition"
              />
            </div>
          }
        />
      </div>
      <TableContainer>
        <table className="w-full min-w-[640px]">
          <TableHead columns={['Customer', 'Service', 'Date & Time', 'Status', 'Action']} />
          <tbody>
            {isLoading ? (
              <TableSkeletonRows rows={3} columns={5} />
            ) : !requests.length ? (
              <TableEmptyState columns={5} icon={FiTool} title="No installation requests found" description={debouncedSearch ? 'Try adjusting your search.' : undefined} />
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50/80 transition">
                  <td className="p-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {req.user?.firstName?.[0]}{req.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{req.user?.firstName} {req.user?.lastName}</p>
                        <p className="text-[11px] text-gray-500">{req.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{req.service?.name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(req.preferredDate).toLocaleDateString()}
                    {formatTimeSlot(req.timeSlot) && (
                      <span className="block text-xs text-gray-400">{formatTimeSlot(req.timeSlot)}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_COLORS[req.status] || 'bg-gray-100 text-gray-700'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-700 transition px-3 py-1.5 rounded-lg hover:bg-primary-50"
                    >
                      View <FiChevronDown size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableContainer>
      <Pagination page={page} limit={PAGE_SIZE} total={data?.meta?.total || 0} onPageChange={setPage} />

      <AnimatePresence>
        {selectedRequest && (
          <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
