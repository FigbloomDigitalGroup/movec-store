import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1.5 text-sm">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <FiChevronRight size={14} className="text-gray-300 flex-shrink-0" aria-hidden="true" />}
              {item.to && !isLast ? (
                <Link to={item.to} className="text-gray-500 hover:text-gray-700 transition">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-gray-900 font-medium' : 'text-gray-500'} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
