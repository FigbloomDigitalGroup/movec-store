import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="mb-4 flex items-center gap-2"><FiMapPin /> Nairobi, Kenya</p>
      <p className="mb-4 flex items-center gap-2"><FiPhone /> +254 727572310</p>
      <p className="mb-4 flex items-center gap-2"><FiMail /> info@starlinkcctv.co.ke</p>
      <a href="https://wa.me/254727572310" target="_blank" className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">Chat on WhatsApp</a>
    </div>
  );
}