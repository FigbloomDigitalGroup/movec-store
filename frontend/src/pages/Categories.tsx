import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import SectionHero from '../components/ui/SectionHero';
import { FiWifi, FiCamera, FiHardDrive, FiServer, FiCpu, FiTool } from 'react-icons/fi';

const categoryIcons: Record<string, any> = {
  'starlink-kits': FiWifi,
  'starlink-accessories': FiTool,
  'cctv-cameras': FiCamera,
  'dvr-nvr': FiServer,
  'hard-drives': FiHardDrive,
  'network-equipment': FiCpu,
  'installation-accessories': FiTool,
};

const categoryColors: Record<string, string> = {
  // Use the primary accent for all category tiles to keep a unified accent language
  'starlink-kits': 'bg-accent-100 text-accent',
  'starlink-accessories': 'bg-accent-100 text-accent',
  'cctv-cameras': 'bg-accent-100 text-accent',
  'dvr-nvr': 'bg-accent-100 text-accent',
  'hard-drives': 'bg-accent-100 text-accent',
  'network-equipment': 'bg-accent-100 text-accent',
  'installation-accessories': 'bg-accent-100 text-accent',
};

export default function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  if (isLoading) return <div className="w-full px-4 py-8">Loading...</div>;

  return (
    <div className="w-full px-4 py-8">
      <SectionHero title="Categories" subtitle="Browse products by category" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((cat: any) => {
          const Icon = categoryIcons[cat.slug] || FiTool;
          const colorClass = categoryColors[cat.slug] || 'bg-blue-100 text-blue-600';

          return (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-xl hover:scale-[1.02] transition flex items-center gap-6"
            >
              <div className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{cat.name}</h3>
                {cat.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{cat.description}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {!categories?.length && (
        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl">
          <p className="text-gray-500 text-lg">No categories found.</p>
        </div>
      )}
    </div>
  );
}
