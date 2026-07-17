import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Starlink CCTV</h3>
          <p>Your trusted partner for Starlink internet and CCTV security solutions in Kenya.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/products" className="hover:text-white">Products</Link>
            <Link to="/installation" className="hover:text-white">Installation</Link>
            <Link to="/support/faqs" className="hover:text-white">FAQs</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p>Nairobi, Kenya</p>
          <p>+254 700 000 000</p>
          <p>info@starlinkcctv.co.ke</p>
        </div>
      </div>
      <div className="text-center mt-8 text-sm">
        &copy; {new Date().getFullYear()} Starlink CCTV. All rights reserved.
      </div>
    </footer>
  );
}