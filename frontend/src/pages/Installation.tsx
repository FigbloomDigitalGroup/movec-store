import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export default function InstallationPage() {
  const [serviceId, setServiceId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');

  const { data: services } = useQuery({ queryKey: ['installation-services'], queryFn: () => api.get('/installation/services').then(r => r.data) });
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: () => api.get('/users/me/addresses').then(r => r.data) });

  const submit = useMutation({
    mutationFn: () => api.post('/installation/requests', { serviceId, preferredDate: new Date(preferredDate).toISOString(), addressId: addresses?.[0]?.id, notes }),
    onSuccess: () => alert('Installation request submitted!'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book Installation</h1>
      <div className="space-y-4">
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full border rounded-lg px-4 py-2">
          <option value="">Select service</option>
          {services?.map((s: any) => <option key={s.id} value={s.id}>{s.name} - KES {s.basePrice.toLocaleString()}</option>)}
        </select>
        <input type="datetime-local" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="w-full border rounded-lg px-4 py-2" rows={3} />
        <button onClick={() => submit.mutate()} disabled={submit.isPending} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">Submit Request</button>
      </div>
    </div>
  );
}