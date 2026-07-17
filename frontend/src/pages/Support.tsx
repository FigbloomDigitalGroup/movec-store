import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function SupportPage() {
  const { data: faqs } = useQuery({ queryKey: ['faqs'], queryFn: () => api.get('/support/faqs').then(r => r.data) });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">FAQs</h1>
      {!faqs?.length ? <p>No FAQs available.</p> : faqs.map((faq: any) => (
        <details key={faq.id} className="border-b py-4">
          <summary className="font-semibold cursor-pointer">{faq.question}</summary>
          <p className="mt-2 text-gray-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}