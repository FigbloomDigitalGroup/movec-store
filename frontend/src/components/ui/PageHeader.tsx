import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

interface PageHeaderProps {
  icon: IconType;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}

/**
 * The icon+title+subtitle+action card repeated (with drifting details — a
 * hardcoded hex icon color here, text-blue-600 there) at the top of most admin
 * pages, e.g. AdminOrders and AdminSupport. `action` is rendered as-is so
 * callers keep sizing it themselves (a search input, a button, a filter group).
 */
export default function PageHeader({ icon: Icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Icon className="text-primary-500" /> {title}
        </h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
