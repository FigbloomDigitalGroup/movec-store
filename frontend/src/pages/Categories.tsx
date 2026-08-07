import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
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
  'starlink-kits': 'bg-blue-100 text-blue-600',
  'starlink-accessories': 'bg-purple-100 text-purple-600',
  'cctv-cameras': 'bg-green-100 text-green-600',
  'dvr-nvr': 'bg-orange-100 text-orange-600',
  'hard-drives': 'bg-yellow-100 text-yellow-600',
  'network-equipment': 'bg-pink-100 text-pink-600',
  'installation-accessories': 'bg-gray-100 text-gray-600',
};

export default function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  if (isLoading) return <div className="w-full px-4 py-8">Loading...</div>;

  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-white">Categories</h1>
      <p className="text-gray-300 mb-8">Browse products by category</p>

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
