import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  FiBell,
  FiSend,
  FiUsers,
  FiUser,
  FiTrash2,
  FiSearch,
  FiSmartphone,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 10;

interface NotificationLog {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AdminNotifications() {
  const [recipientMode, setRecipientMode] = useState<'all' | 'single'>('all');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [type, setType] = useState('PROMO');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch users for customer selector dropdown
  const { data: usersData } = useQuery<{ users: UserOption[] }>({
    queryKey: ['admin-users-list'],
    queryFn: () => api.get('/admin/users?limit=100').then((r) => r.data),
  });

  // Fetch past notification logs
  const { data: notificationLogs, isLoading: logsLoading } = useQuery<{ data: NotificationLog[]; meta: { total: number } }>({
    queryKey: ['admin-notification-logs', filterType, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (filterType !== 'all') params.set('type', filterType);
      return api.get(`/admin/notifications?${params.toString()}`).then((r) => r.data);
    },
  });

  // Mutation: Send to Single User
  const sendSingleMutation = useMutation({
    mutationFn: () =>
      api.post('/admin/notifications/send', {
        userId: selectedUserId,
        type,
        title,
        message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notification-logs'] });
      toast.success('Notification sent to customer!');
      resetForm();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Mutation: Broadcast to All Users
  const sendAllMutation = useMutation({
    mutationFn: () =>
      api.post('/admin/notifications/send-all', {
        type,
        title,
        message,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-notification-logs'] });
      const count = res.data?.sent || 'all';
      toast.success(`Broadcast sent to ${count} active customers!`);
      resetForm();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Mutation: Delete notification log entry
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notification-logs'] });
      toast.success('Notification deleted from history');
      setPendingDeleteId(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setSelectedUserId('');
    setUserSearch('');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both title and message text.');
      return;
    }
    if (recipientMode === 'single' && !selectedUserId) {
      toast.error('Please select a recipient customer.');
      return;
    }

    if (recipientMode === 'all') {
      sendAllMutation.mutate();
    } else {
      sendSingleMutation.mutate();
    }
  };

  const isSending = sendSingleMutation.isPending || sendAllMutation.isPending;

  const usersList = usersData?.users || [];
  const filteredUsers = usersList.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const logs = notificationLogs?.data || [];
  const logsTotal = notificationLogs?.meta?.total || 0;

  const getTypeBadge = (t: string) => {
    switch (t.toUpperCase()) {
      case 'PROMO':
        return <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">PROMO</span>;
      case 'ORDER':
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ORDER</span>;
      case 'INSTALLATION':
        return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">INSTALLATION</span>;
      case 'SYSTEM':
        return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">SYSTEM</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{t}</span>;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        icon={FiBell}
        title="Notifications & Broadcast Center"
        subtitle="Send real-time promotional updates, order alerts, and system notices to customers."
        action={
          <div className="flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-100 px-4 py-2 rounded-xl text-xs font-semibold">
            <FiUsers size={16} /> Broadcast Studio Ready
          </div>
        }
      />

      {/* Main Grid: Form + Live Preview (Left) vs History Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiSend className="text-primary-500" /> Send New Notification
            </h2>

            <form onSubmit={handleSend} className="space-y-4">
              {/* Recipient Mode Tabs */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Select Recipient Target
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setRecipientMode('all')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      recipientMode === 'all'
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiUsers size={14} /> Broadcast to All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientMode('single')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      recipientMode === 'single'
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiUser size={14} /> Single Customer
                  </button>
                </div>
              </div>

              {/* Customer Selector if Single Mode */}
              {recipientMode === 'single' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">Select Target Customer</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search customer by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  {/* Customer Dropdown */}
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Choose a customer from list --</option>
                    {filteredUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}

              {/* Notification Category / Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Notification Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'PROMO', label: 'Promo 🏷️' },
                    { key: 'ORDER', label: 'Order 📦' },
                    { key: 'INSTALLATION', label: 'Install 🛠️' },
                    { key: 'SYSTEM', label: 'System ⚡' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setType(cat.key)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        type === cat.key
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  placeholder="e.g. Starlink Gen 3 Kits Now Available! 🛰️"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-white transition"
                />
              </div>

              {/* Message Body Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Content</label>
                <textarea
                  placeholder="Write message details for your customers..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-white transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-primary-500/20"
              >
                <FiSend size={15} />
                {isSending
                  ? 'Sending...'
                  : recipientMode === 'all'
                  ? 'Broadcast Notification to All Customers'
                  : 'Send Direct Notification to Selected Customer'}
              </button>
            </form>
          </div>

          {/* Live Mobile Notification Preview */}
          <div className="bg-gradient-to-br from-slate-900 to-gray-900 rounded-2xl p-5 text-white border border-gray-800 shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-200 flex items-center gap-1.5">
                <FiSmartphone size={14} /> Mobile App Preview
              </span>
              <span className="text-[10px] text-gray-400">Live Render</span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <FiBell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-200">
                    Movec Store • {type}
                  </span>
                  <span className="text-[10px] text-gray-400">Just now</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5 truncate">
                  {title.trim() || 'Notification Title Here'}
                </h4>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                  {message.trim() || 'Notification message text will display here as typed above.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notification History Logs (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Sent Notification Logs</h3>
                <p className="text-xs text-gray-400">History of recent alerts</p>
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs text-gray-700 font-semibold focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="PROMO">PROMO</option>
                <option value="ORDER">ORDER</option>
                <option value="INSTALLATION">INSTALLATION</option>
                <option value="SYSTEM">SYSTEM</option>
              </select>
            </div>

            {/* Notification History List */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {logsLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-xl space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                ))
              ) : logs.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <FiBell size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-semibold">No notification logs found</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 rounded-2xl transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getTypeBadge(log.type)}
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 leading-snug">{log.title}</h4>
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">{log.message}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-200/50 text-[10px]">
                      <span className="text-gray-500 font-medium truncate max-w-[200px]">
                        Recipient:{' '}
                        {log.user
                          ? `${log.user.firstName} ${log.user.lastName}`
                          : 'Broadcast (All Customers)'}
                      </span>
                      <button
                        onClick={() => setPendingDeleteId(log.id)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                        title="Delete log"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination page={page} limit={PAGE_SIZE} total={logsTotal} onPageChange={setPage} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this notification log?"
        description="This removes it from the history list. It cannot be undone."
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() => pendingDeleteId && deleteMutation.mutate(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}