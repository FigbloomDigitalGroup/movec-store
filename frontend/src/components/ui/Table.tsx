import type { ReactNode } from 'react';
import Skeleton from './Skeleton';

export function TableContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function TableHead({ columns }: { columns: ReactNode[] }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((col, i) => (
          <th key={i} className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableSkeletonRows({ rows = 3, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="border-t border-gray-100">
          <td className="p-4" colSpan={columns}>
            <Skeleton className="h-4 w-full" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function TableEmptyState({
  columns,
  icon: Icon,
  title,
  description,
}: {
  columns: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
}) {
  return (
    <tr>
      <td colSpan={columns} className="p-12 text-center">
        <Icon size={40} className="mx-auto text-gray-300 mb-3" />
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {description && <p className="text-gray-500 text-xs mt-1">{description}</p>}
      </td>
    </tr>
  );
}
