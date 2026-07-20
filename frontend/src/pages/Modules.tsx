import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getModules } from '../lib/api';
import { FiPackage, FiArrowRight, FiGrid, FiWifi, FiCamera, FiTool } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface StoreModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count: { products: number };
  categories: { id: string; name: string; slug: string }[];
}

const MODULE_CONFIG: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  starlink: {
    icon: <FiWifi size={32} />,
    color: 'blue',
    gradient: 'from-blue-600 to-cyan-500',
  },
  cctv: {
    icon: <FiCamera size={32} />,
    color: 'green',
    gradient: 'from-green-600 to-emerald-500',
  },
  installation: {
    icon: <FiTool size={32} />,
    color: 'purple',
    gradient: 'from-purple-600 to-pink-500',
  },
};

const DEFAULT_CONFIG = {
  icon: <FiPackage size={32} />,
  color: 'gray',
  gradient: 'from-gray-600 to-slate-500',
};

export default function Modules() {
  const { data: modules, isLoading } = useQuery<StoreModule[]>({
    queryKey: ['modules'],
    queryFn: getModules,
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-6">
              <FiGrid size={18} />
              <span className="text-sm font-medium">All Solutions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Shop by <span className="text-blue-600">Solution</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Everything you need for connectivity and security — organized into focused product lines.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(modules || []).map((mod) => {
              const config = MODULE_CONFIG[mod.slug] || DEFAULT_CONFIG;
              return (
                <Link key={mod.id} to={`/modules/${mod.slug}`}>
                  <Card hover>
                    <CardBody>
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg`}>
                          {config.icon}
                        </div>
                        <Badge variant="primary">
                          {mod._count.products} Products
                        </Badge>
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                        {mod.name}
                      </h2>
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        {mod.description}
                      </p>

                      {mod.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {mod.categories.map((cat) => (
                            <span
                              key={cat.id}
                              className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                        Browse {mod.name}
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* All Products fallback */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4">Looking for something specific?</p>
          <Link to="/products">
            <Button variant="outline">
              <FiPackage className="mr-2" size={18} />
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
