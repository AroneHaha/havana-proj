import type { OrderStatus } from "@/store/orders-store";
import { ORDER_STATUS_COLORS, ORDER_STATUS_DOT_COLORS } from "@/lib/constant";

interface StatusBadgeProps {
  status: OrderStatus;
  label: string;
  dotColor?: string;
  badgeColor?: string;
}

export function StatusBadge({ status, label, dotColor, badgeColor }: StatusBadgeProps) {
  const badge = badgeColor ?? ORDER_STATUS_COLORS[status];
  const dot = dotColor ?? ORDER_STATUS_DOT_COLORS[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
