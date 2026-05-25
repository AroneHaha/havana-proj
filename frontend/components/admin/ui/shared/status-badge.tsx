import { ORDER_STATUS_COLORS, ORDER_STATUS_DOT_COLORS, PRODUCT_STATUS_CONFIG } from "@/lib/constant";
import type { ProductStatus, OrderStatus } from "@/types";

interface StatusBadgeProps {
  /** Status key — can be an OrderStatus or ProductStatus string */
  status: string;
  /** Display label */
  label: string;
  /** Override dot color class */
  dotColor?: string;
  /** Override badge color class */
  badgeColor?: string;
}

/**
 * Unified StatusBadge — works for both OrderStatus and ProductStatus.
 *
 * For OrderStatus, auto-resolves colors from ORDER_STATUS_COLORS.
 * For ProductStatus, auto-resolves colors from PRODUCT_STATUS_CONFIG.
 * Falls back to provided dotColor/badgeColor or muted defaults.
 */
export function StatusBadge({ status, label, dotColor, badgeColor }: StatusBadgeProps) {
  // Try order status colors first
  if (!badgeColor && status in ORDER_STATUS_COLORS) {
    badgeColor = ORDER_STATUS_COLORS[status as OrderStatus];
  }
  if (!dotColor && status in ORDER_STATUS_DOT_COLORS) {
    dotColor = ORDER_STATUS_DOT_COLORS[status as OrderStatus];
  }

  // Try product status colors
  if (!badgeColor && status in PRODUCT_STATUS_CONFIG) {
    const cfg = PRODUCT_STATUS_CONFIG[status as ProductStatus];
    badgeColor = cfg.color;
    dotColor = cfg.dot;
  }

  // Fallback
  const badge = badgeColor ?? "bg-muted text-muted-foreground";
  const dot = dotColor ?? "bg-muted-foreground";

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
