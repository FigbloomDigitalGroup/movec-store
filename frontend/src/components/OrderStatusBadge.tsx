import { getOrderStatusConfig } from '../lib/orderStatus';

const SIZE_CLASSES = {
  sm: 'px-2.5 py-1 text-[11px] gap-1.5',
  md: 'px-3 py-1 text-xs gap-1.5',
  lg: 'px-4 py-1.5 text-sm gap-2',
};

export default function OrderStatusBadge({
  status,
  size = 'md',
  withBorder = true,
}: {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  withBorder?: boolean;
}) {
  const cfg = getOrderStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${withBorder ? 'border' : ''} ${cfg.bg} ${cfg.text} ${withBorder ? cfg.border : ''} ${SIZE_CLASSES[size]}`}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}
