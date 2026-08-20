import type { ReactNode } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo } from 'react-icons/fi';

interface AlertProps {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
  className?: string;
}

const VARIANTS = {
  success: { style: 'bg-green-50 text-green-700 border-green-200', icon: FiCheckCircle },
  warning: { style: 'bg-amber-50 text-amber-800 border-amber-200', icon: FiAlertTriangle },
  danger: { style: 'bg-red-50 text-red-700 border-red-200', icon: FiXCircle },
  info: { style: 'bg-blue-50 text-blue-700 border-blue-200', icon: FiInfo },
};

export default function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  const { style, icon: Icon } = VARIANTS[variant];
  return (
    <div role="alert" className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm ${style} ${className}`}>
      <Icon size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
