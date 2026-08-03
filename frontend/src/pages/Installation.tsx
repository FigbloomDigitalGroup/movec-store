import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import CustomCalendar from '../components/CustomCalendar';
import CustomDropdown from '../components/CustomDropdown';

export default function InstallationPage() {
  const [serviceId, setServiceId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');

  const dateInputRef = useRef<HTMLDivElement>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);

  const { data: services } = useQuery({ queryKey: ['installation-services'], queryFn: () => api.get('/installation/services').then(r => r.data) });
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: () => api.get('/users/me/addresses').then(r => r.data) });

  const submit = useMutation({
    mutationFn: () => api.post('/installation/requests', { serviceId, preferredDate: new Date(preferredDate).toISOString(), addressId: addresses?.[0]?.id, notes }),
    onSuccess: () => alert('Installation request submitted!'),
  });

  // Auto-progression handlers
  const handleServiceComplete = () => {
    // Focus on date input after service selection
    dateInputRef.current?.querySelector('input')?.focus();
  };

  const handleDateComplete = () => {
    // Focus on notes field after date selection
    notesInputRef.current?.focus();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Book Installation</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Service Selection with Custom Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Service
            </label>
            <CustomDropdown
              options={services?.map((s: any) => ({
                id: s.id,
                name: s.name,
                price: s.basePrice
              })) || []}
              value={serviceId}
              onChange={setServiceId}
              placeholder="Choose installation service"
              onComplete={handleServiceComplete}
            />
          </div>

          {/* Date Selection with Custom Calendar */}
          <div ref={dateInputRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date
            </label>
            <CustomCalendar
              value={preferredDate}
              onChange={setPreferredDate}
              onComplete={handleDateComplete}
            />
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              ref={notesInputRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or instructions..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => submit.mutate()}
            disabled={submit.isPending || !serviceId || !preferredDate}
            className={`
              w-full py-3 rounded-lg font-medium transition-all duration-200
              ${submit.isPending || !serviceId || !preferredDate
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md'
              }
            `}
          >
            {submit.isPending ? 'Submitting...' : 'Submit Installation Request'}
          </button>
        </div>
      </div>
    </div>
  );
}