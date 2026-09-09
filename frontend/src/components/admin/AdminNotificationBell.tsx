import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { FiBell } from 'react-icons/fi';

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

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

export default function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Unread count — polled every 30s (no websocket/live-push infra in this codebase)
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['admin-notification-unread-count'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Notification list — only fetched while the dropdown is open
  const { data: notifications = [], isLoading } = useQuery<AdminNotification[]>({
    queryKey: ['admin-notification-list'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
    enabled: isOpen,
  });

  // Live push on top of the 30s poll above: nudges both queries the instant a
  // new admin notification lands, instead of waiting out the poll interval.
  // Auth is via httpOnly cookie, so withCredentials lets EventSource send it —
  // no token-in-URL workaround needed. If the stream drops, the native
  // EventSource auto-reconnects; if it fails outright, the 30s poll still works.
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const source = new EventSource(`${baseUrl}/notifications/stream`, {
      withCredentials: true,
    });

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string);
        if (payload?.type === 'update') {
          queryClient.invalidateQueries({ queryKey: ['admin-notification-unread-count'] });
          queryClient.invalidateQueries({ queryKey: ['admin-notification-list'] });
        }
      } catch {
        // Ignore malformed/heartbeat payloads that aren't JSON.
      }
    };

    return () => source.close();
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notification-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-list'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notification-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notification-list'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleNotificationClick = (n: AdminNotification) => {
    if (!n.isRead) {
      markReadMutation.mutate(n.id);
    }
    if (n.type.toUpperCase() === 'ORDER') {
      navigate('/admin/orders');
    } else if (n.type.toUpperCase() === 'INSTALLATION') {
      navigate('/admin/installations');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition"
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[370px] max-w-[90vw] bg-white rounded-xl border border-gray-100 shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-xs font-semibold">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiBell size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition flex gap-2 ${
                    !n.isRead ? 'bg-primary-50/40' : ''
                  }`}
                >
                  <div className="flex-shrink-0 pt-1.5">
                    {!n.isRead && <span className="block w-2 h-2 rounded-full bg-primary-500" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      {getTypeBadge(n.type)}
                      <span className="text-[10px] text-gray-500 flex-shrink-0">
                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <h4 className={`text-xs leading-snug ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
