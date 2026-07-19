import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';

export default function AdminNotifications() {
  const [form, setForm] = useState({ userId: '', type: 'promo', title: '', message: '' });
  const [sent, setSent] = useState(false);

  const sendNotif = useMutation({
    mutationFn: (body: any) => api.post('/admin/notifications/send', body),
    onSuccess: () => { setSent(true); setForm({ userId: '', type: 'promo', title: '', message: '' }); },
  });

  const sendAll = useMutation({
    mutationFn: () => api.post('/admin/notifications/send-all', { type: form.type, title: form.title, message: form.message }),
    onSuccess: () => setSent(true),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 max-w-2xl">
        {sent && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">Notification sent!</p>}
        <div className="space-y-4">
          <input placeholder="User ID" value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-4 py-2 w-full" />
          <textarea placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="border rounded-lg px-4 py-2 w-full" rows={3} />
          <div className="flex gap-4">
            <button onClick={() => sendNotif.mutate(form)} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Send to User</button>
            <button onClick={() => sendAll.mutate()} className="bg-purple-600 text-white px-6 py-2 rounded-lg">Send to All</button>
          </div>
        </div>
      </div>
    </div>
  );
}