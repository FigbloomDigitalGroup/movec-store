import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getModules } from '../lib/api';
import { FiPackage, FiArrowRight, FiGrid } from 'react-icons/fi';

interface StoreModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count: { products: number };
  categories: { id: string; name: string; slug: string }[];
}

const MODULE_THEMES: Record<string, { gradient: string; accent: string; icon: string; bg: string }> = {
  starlink: {
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    accent: 'text-blue-300',
    icon: '🛰️',
    bg: 'from-blue-900/40 to-indigo-900/40',
  },
  cctv: {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    accent: 'text-emerald-300',
    icon: '📹',
    bg: 'from-emerald-900/40 to-teal-900/40',
  },
};

const DEFAULT_THEME = {
  gradient: 'from-slate-600 via-gray-600 to-zinc-700',
  accent: 'text-slate-300',
  icon: '📦',
  bg: 'from-slate-900/40 to-gray-900/40',
};

export default function Modules() {
  const { data: modules, isLoading } = useQuery<StoreModule[]>({
    queryKey: ['modules'],
    queryFn: getModules,
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <FiGrid className="text-blue-400" size={14} />
            <span className="text-blue-300 text-sm font-medium">All Solutions</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Shop by <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Solution</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need for connectivity and security — organised into focused product lines.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(modules || []).map((mod) => {
              const theme = MODULE_THEMES[mod.slug] || DEFAULT_THEME;
              return (
                <Link
                  key={mod.id}
                  to={`/modules/${mod.slug}`}
                  className="group relative rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg}`} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                  <div className="relative p-8 md:p-10">
                    {/* Icon + Badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                        {theme.icon}
                      </div>
                      <span className="bg-white/10 border border-white/20 text-white/70 text-xs font-medium px-3 py-1 rounded-full">
                        {mod._count.products} Products
                      </span>
                    </div>

                    {/* Name & description */}
                    <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all"
                      style={{ backgroundImage: `linear-gradient(to right, ${theme.accent.replace('text-', '')}, white)` }}>
                      {mod.name}
                    </h2>
                    <p className="text-gray-400 text-base leading-relaxed mb-8">
                      {mod.description}
                    </p>

                    {/* Categories */}
                    {mod.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {mod.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full border border-white/10"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className={`inline-flex items-center gap-2 font-semibold ${theme.accent} group-hover:gap-3 transition-all`}>
                      Browse {mod.name}
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* All Products fallback */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">Looking for something specific?</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl transition-all"
          >
            <FiPackage size={18} />
            Browse All Products
          </Link>
        </div>
      </div>
    </div>
  );
}
