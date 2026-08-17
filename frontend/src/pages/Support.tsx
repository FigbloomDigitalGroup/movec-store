import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { FiSearch, FiChevronDown, FiChevronUp, FiHelpCircle, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SectionHero from '../components/ui/SectionHero';

const WHATSAPP_NUMBER = '254796285718';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: { name: string; slug: string } | null;
}

const STATIC_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What products do you sell?',
    answer: 'We supply Starlink internet kits, accessories, mounting solutions, and intelligent CCTV systems including cameras, NVRs, storage devices, and installation accessories.',
    category: { name: 'General & Products', slug: 'general' },
  },
  {
    id: 'faq-2',
    question: 'Do you sell genuine Starlink equipment?',
    answer: 'Yes. We provide genuine Starlink hardware and compatible accessories. Product availability may vary by location.',
    category: { name: 'Starlink Internet', slug: 'starlink' },
  },
  {
    id: 'faq-3',
    question: 'Does Starlink work in my area?',
    answer: 'Starlink coverage depends on your service address. Contact us with your location and we will help you confirm availability before purchase.',
    category: { name: 'Starlink Internet', slug: 'starlink' },
  },
  {
    id: 'faq-4',
    question: 'Is installation included with Starlink purchases?',
    answer: 'Installation can be arranged as an additional service. We can assist with setup, mounting, cable routing, and network configuration.',
    category: { name: 'Starlink Internet', slug: 'starlink' },
  },
  {
    id: 'faq-5',
    question: 'What is an intelligent CCTV system?',
    answer: 'An intelligent CCTV system uses features such as motion detection, person and vehicle recognition, intrusion alerts, remote viewing, and recording to improve security monitoring.',
    category: { name: 'CCTV & Security', slug: 'cctv' },
  },
  {
    id: 'faq-6',
    question: 'Can I view my CCTV cameras remotely?',
    answer: 'Yes. Most of our CCTV systems support secure remote viewing through a mobile app or computer, provided the system has an internet connection.',
    category: { name: 'CCTV & Security', slug: 'cctv' },
  },
  {
    id: 'faq-7',
    question: 'Do CCTV cameras record at night?',
    answer: 'Yes. Many models include infrared night vision, while selected models offer full-colour night vision for clearer low-light footage.',
    category: { name: 'CCTV & Security', slug: 'cctv' },
  },
  {
    id: 'faq-8',
    question: 'How long is CCTV footage stored?',
    answer: 'Storage time depends on the number of cameras, video quality, recording schedule, and hard-drive capacity. We can recommend the right storage size for your needs.',
    category: { name: 'CCTV & Security', slug: 'cctv' },
  },
  {
    id: 'faq-9',
    question: 'Do you provide CCTV installation?',
    answer: 'Yes. We offer professional installation, configuration, testing, and user guidance for homes, shops, offices, schools, and other premises.',
    category: { name: 'CCTV & Security', slug: 'cctv' },
  },
  {
    id: 'faq-10',
    question: 'What payment methods do you accept?',
    answer: 'We accept the payment options displayed at checkout. For large installations or business orders, please contact us for a quotation.',
    category: { name: 'General & Products', slug: 'general' },
  },
  {
    id: 'faq-11',
    question: 'How long does delivery take?',
    answer: 'Delivery times depend on product availability and your location. Estimated delivery details are provided during checkout or upon confirmation of your order.',
    category: { name: 'General & Products', slug: 'general' },
  },
  {
    id: 'faq-12',
    question: 'What is your return and warranty policy?',
    answer: 'Eligible products may be returned according to our return policy. Products are covered by applicable manufacturer warranties; please retain your receipt and original packaging.',
    category: { name: 'General & Products', slug: 'general' },
  },
  {
    id: 'faq-13',
    question: 'Can I get a quotation for multiple items or a full installation?',
    answer: 'Yes. Send us your requirements, location, and preferred products, and we will prepare a tailored quotation.',
    category: { name: 'Installation & Support', slug: 'support' },
  },
  {
    id: 'faq-14',
    question: 'How can I get technical support?',
    answer: 'Contact our support team with your order number, product model, and a brief description of the issue. We will guide you through troubleshooting or arrange further assistance.',
    category: { name: 'Installation & Support', slug: 'support' },
  },
];

export default function SupportPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const { data: apiFaqs } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => api.get('/support/faqs').then((r) => r.data),
  });

  const faqs: FAQItem[] = apiFaqs && apiFaqs.length > 0 ? apiFaqs : STATIC_FAQS;

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'general', label: 'General & Products' },
    { id: 'starlink', label: 'Starlink Internet' },
    { id: 'cctv', label: 'CCTV & Security' },
    { id: 'support', label: 'Installation & Support' },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());

    const catSlug = item.category?.slug || '';
    const matchesCategory =
      activeCategory === 'all' ||
      catSlug === activeCategory ||
      (activeCategory === 'general' && (!catSlug || catSlug === 'general'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-16">
      <SectionHero title="Frequently Asked Questions" subtitle="Find quick answers about products, installation, delivery, and warranty.">
        <div className="mt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent border border-accent mb-4">
            <FiHelpCircle size={14} /> Help & Knowledge Base
          </div>

          <p className="text-gray-500 text-base md:text-lg max-w-2xl mb-6">
            Find quick answers to common questions about Starlink kits, CCTV security systems, installation services, payments, and warranties.
          </p>

          <div className="relative max-w-xl mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions (e.g. Starlink, CCTV night vision, delivery...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white text-gray-900 placeholder-gray-500 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            />
          </div>
        </div>
      </SectionHero>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#10b982] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <FiHelpCircle className="mx-auto text-gray-300 mb-3" size={48} />
              <h3 className="text-lg font-bold text-gray-800 mb-1">No matching questions found</h3>
              <p className="text-gray-500 text-sm mb-4">
                Try adjusting your search terms or selecting a different category.
              </p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); }}
                className="text-[#10b982] font-semibold hover:underline text-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = !!openIds[faq.id];
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:border-[#10b982]/50 transition"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-semibold text-gray-900 hover:text-[#10b982] transition"
                  >
                    <span className="flex items-center gap-3 text-base">
                      <FiHelpCircle className="text-[#10b982] flex-shrink-0" size={20} />
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <FiChevronUp size={20} className="text-[#10b982] flex-shrink-0" />
                    ) : (
                      <FiChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-gray-700 text-sm leading-relaxed border-t border-gray-100 bg-gray-50/50 pl-14">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions? Banner */}
        <div className="mt-14 bg-gradient-to-r from-slate-900 to-gray-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[#10b982] text-xs font-bold uppercase tracking-wider mb-1 block">
              Direct Assistance
            </span>
            <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
            <p className="text-gray-300 text-sm max-w-md">
              Our team of technical experts and sales consultants are available to guide you on Starlink coverage, CCTV planning, and custom quotes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20bd5a] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-lg"
            >
              <FaWhatsapp size={18} />
              WhatsApp Us
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition"
            >
              <FiMail size={16} />
              Contact Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}