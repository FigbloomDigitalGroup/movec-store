import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getModules } from '../lib/api';
import { FiPackage, FiArrowRight, FiGrid, FiWifi, FiCamera } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface StoreModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count?: { products: number };
  categories?: { id: string; name: string; slug: string }[];
}

const MODULE_CONFIG: Record<string, { icon: React.ReactNode; gradient: string }> = {
  starlink: {
    icon: <FiWifi size={36} />,
    gradient: 'from-orange-500 to-green-500',
  },
  cctv: {
    icon: <FiCamera size={36} />,
    gradient: 'from-green-600 to-emerald-500',
  },
};

const DEFAULT_CONFIG = {
  icon: <FiPackage size={36} />,
  gradient: 'from-gray-600 to-slate-500',
};

/** Shown when the API is empty or unavailable so Solutions always lists clickable modules. */
const FALLBACK_MODULES: StoreModule[] = [
  {
    id: 'module-starlink',
    name: 'Starlink',
    slug: 'starlink',
    description:
      'High-speed satellite internet solutions powered by SpaceX Starlink. Kits, accessories, and mounts for home and mobile use.',
    imageUrl: null,
    _count: { products: 0 },
    categories: [
      { id: '1', name: 'Starlink Kits', slug: 'starlink-kits' },
      { id: '2', name: 'Starlink Accessories', slug: 'starlink-accessories' },
      { id: '3', name: 'Starlink Mounts', slug: 'starlink-mounts' },
    ],
  },
  {
    id: 'module-cctv',
    name: 'CCTV & Security',
    slug: 'cctv',
    description:
      'Professional CCTV cameras, DVRs, NVRs and surveillance accessories for homes and businesses.',
    imageUrl: null,
    _count: { products: 0 },
    categories: [
      { id: '4', name: 'IP Cameras', slug: 'ip-cameras' },
      { id: '5', name: 'DVR / NVR', slug: 'dvr-nvr' },
      { id: '6', name: 'Hard Drives', slug: 'surveillance-hard-drives' },
    ],
  },
];

function ModuleCard({ mod }: { mod: StoreModule }) {
  const config = MODULE_CONFIG[mod.slug] || DEFAULT_CONFIG;
  const productCount = mod._count?.products ?? 0;
  const categories = mod.categories ?? [];

  return (
    <Link
      to={`/solutions/${mod.slug}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl"
    >
      <Card hover className="h-full transition-shadow group-hover:border-blue-200 group-hover:shadow-lg">
        <CardBody className="flex h-full flex-col">
          <div className={`mb-6 rounded-2xl bg-gradient-to-br ${config.gradient} p-8 text-white shadow-lg`}>
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-white/20 p-4 backdrop-blur-sm">{config.icon}</div>
              {productCount > 0 && (
                <Badge variant="gray" className="!bg-white/20 !text-white">
                  {productCount} Products
                </Badge>
              )}
            </div>
            <h2 className="mt-6 text-2xl font-bold md:text-3xl">{mod.name}</h2>
          </div>

          <p className="mb-6 flex-1 leading-relaxed text-gray-700">
            {mod.description}
          </p>

          {categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 font-semibold text-blue-600 transition-all group-hover:gap-3">
            Explore {mod.name}
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

export default function Modules() {
  const { data: modules, isLoading, isError } = useQuery<StoreModule[]>({
    queryKey: ['modules'],
    queryFn: getModules,
    retry: 1,
  });

  const displayModules =
    modules && modules.length > 0 ? modules : FALLBACK_MODULES;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700">
              <FiGrid size={18} />
              <span className="text-sm font-medium">All Solutions</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Shop by <span className="text-blue-600">Solution</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-700">
              Choose a product line below to browse kits, accessories, and related services.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
        {isError && (
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            Could not load the latest catalog. Showing available solutions — product counts may update when you open each module.
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {displayModules.map((mod) => (
              <ModuleCard key={mod.id} mod={mod} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-700">Looking for something specific?</p>
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
