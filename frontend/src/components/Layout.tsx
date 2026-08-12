import { Outlet } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import Navbar from './Navbar';
import Footer from './Footer';

const WHATSAPP_NUMBER = '254796285718';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[#25d366]/20 bg-white text-[#25d366] shadow-[0_10px_30px_rgba(37,211,102,0.2)] transition-all duration-200 hover:scale-105 hover:shadow-[0_12px_32px_rgba(37,211,102,0.28)]"
        aria-label="Order via WhatsApp"
      >
        <FaWhatsapp size={28} color="#25D366" />
      </a>
    </div>
  );
}