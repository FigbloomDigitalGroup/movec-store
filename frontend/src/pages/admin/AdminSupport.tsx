import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiSearch, FiX, FiSend, FiUser, FiHeadphones } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import { TableContainer, TableHead, TableSkeletonRows, TableEmptyState } from '../../components/ui/Table';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
const PAGE_SIZE = 20;

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-sky-50 text-sky-700 border-sky-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function TicketDetailModal({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['admin-ticket', ticketId],
    queryFn: () => api.get(`/admin/support/tickets/${ticketId}`).then((r) => r.data),
  });

  const currentStatus = status ?? ticket?.status;

  const updateStatus = useMutation({
    mutationFn: (newStatus: string) => api.patch(`/admin/support/tickets/${ticketId}`, { status: newStatus }),
    onSuccess: (_data, newStatus) => {
      setStatus(newStatus);
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] });
      toast.success('Ticket status updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const sendReply = useMutation({
    mutationFn: () => api.post(`/admin/support/tickets/${ticketId}/messages`, { message: reply.trim() }),
    onSuccess: () => {
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] });
      toast.success('Reply sent');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl"
      >
        {isLoading || !ticket ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">{ticket.subject}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {ticket.user?.firstName} {ticket.user?.lastName} · {ticket.user?.email}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-600 transition">
                <FiX size={20} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus.mutate(s)}
                  disabled={updateStatus.isPending || currentStatus === s}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition disabled:cursor-default ${
                    currentStatus === s
                      ? STATUS_STYLES[s]
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {ticket.messages?.length ? (
                ticket.messages.map((m: any) => (
                  <div key={m.id} className={`flex gap-2 ${m.isStaffReply ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.isStaffReply ? 'bg-primary-50 text-primary-500' : 'bg-gray-100 text-gray-500'}`}>
                      {m.isStaffReply ? <FiHeadphones size={13} /> : <FiUser size={13} />}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.isStaffReply ? 'bg-primary-50 text-gray-900' : 'bg-gray-100 text-gray-900'}`}>
                      <p>{m.message}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(m.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No messages yet.</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex items-end gap-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply..."
                rows={2}
                className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition resize-none"
              />
              <button
                onClick={() => sendReply.mutate()}
                disabled={!reply.trim() || sendReply.isPending}
                className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition flex items-center gap-2 text-sm font-semibold"
              >
                <FiSend size={14} /> {sendReply.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminSupport() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);

  // Debounce the search box so every keystroke doesn't fire its own request.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', statusFilter, debouncedSearch, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (statusFilter) params.set('status', statusFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      return api.get(`/admin/support/tickets?${params.toString()}`).then((r) => r.data);
    },
  });

  const tickets: any[] = data?.data || [];
  const total: number = data?.meta?.total || 0;

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        icon={FiMessageSquare}
        title="Support Tickets"
        subtitle={`${total} ticket${total !== 1 ? 's' : ''} — view, reply, and update status.`}
        action={
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search subject or customer..."
              aria-label="Search support tickets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 transition"
            />
          </div>
        }
      />

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${!statusFilter ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${statusFilter === s ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <TableContainer>
        <table className="w-full min-w-[640px]">
          <TableHead columns={['Subject', 'Customer', 'Messages', 'Status', 'Date', '']} />
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <TableSkeletonRows rows={4} columns={6} />
            ) : tickets.length === 0 ? (
              <TableEmptyState columns={6} icon={FiMessageSquare} title="No tickets found" description="Try a different search or status filter." />
            ) : (
              tickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/80 transition">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">{t.subject}</td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-900">{t.user?.firstName} {t.user?.lastName}</p>
                    <p className="text-[11px] text-gray-500">{t.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600">{t._count?.messages ?? 0}</td>
                  <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-4 text-[11px] text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setOpenTicketId(t.id)}
                      className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition px-3 py-1.5 rounded-lg hover:bg-primary-50"
                    >
                      View & Reply
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableContainer>
      <Pagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />

      <AnimatePresence>
        {openTicketId && (
          <TicketDetailModal ticketId={openTicketId} onClose={() => setOpenTicketId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
