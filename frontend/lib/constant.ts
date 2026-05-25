import type { OrderStatus } from "@/services/orders-service";
import { ProductStatus, ProductFilterStatus } from "@/types";

// ─── Order status colors ────────────────────────────────────────────────

/** Tailwind classes for order status badges */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  preparing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  out_for_delivery: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

/** Tailwind classes for order status dot indicators */
export const ORDER_STATUS_DOT_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  preparing: "bg-purple-500",
  out_for_delivery: "bg-orange-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

// ─── Product status colors ─────────────────────────────────────────────

export const PRODUCT_STATUS_CONFIG: Record<ProductStatus, { label: string; color: string; dot: string }> = {
  in_stock: {
    label: "In Stock",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  low_stock: {
    label: "Low Stock",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  sold_out: {
    label: "Sold Out",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
};

// ─── Filter tabs ───────────────────────────────────────────────────────

/** Filter tabs for the Orders page (all statuses) */
export const ORDER_FILTER_TABS: Array<"all" | OrderStatus> = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

/** Filter tabs for the Sales page (excludes pending & cancelled) */
export const SALES_FILTER_TABS: Array<"all" | "delivered" | "confirmed" | "preparing" | "out_for_delivery"> = [
  "all",
  "delivered",
  "confirmed",
  "preparing",
  "out_for_delivery",
];

/** Filter tabs for the Products page */
export const PRODUCT_FILTER_TABS: Array<{ key: ProductFilterStatus; label: string }> = [
  { key: "all", label: "All Products" },
  { key: "in_stock", label: "In Stock" },
  { key: "low_stock", label: "Low Stock" },
  { key: "sold_out", label: "Sold Out" },
];

// ─── Product categories ─────────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  "Rose Arrangements",
  "Bouquets",
  "Orchids",
  "Lilies",
  "Luxury Boxes",
  "Seasonal",
  "Plants",
  "Accessories",
] as const;

// ─── Admin routes ─────────────────────────────────────────────────────

/**
 * Single source of truth for all admin route path prefixes.
 *
 * Used by:
 *   - middleware.ts       (server-side auth protection)
 *   - layout-switch.tsx   (client-side layout routing)
 *   - site-chrome.tsx     (already guarded by LayoutSwitch, kept for safety)
 *
 * When adding a new admin page, add its prefix here — do NOT create
 * a separate list in any other file.
 */
export const ADMIN_PATHS = [
  "/dashboard",
  "/orders",
  "/products",
  "/reviews",
  "/sales-reviews",
  // Future admin routes — uncomment when pages are created:
  // "/customers",
  // "/analytics",
  // "/settings",
] as const;

/** Type-safe admin path prefix */
export type AdminPath = (typeof ADMIN_PATHS)[number];

// ─── Pagination ────────────────────────────────────────────────────────

export const DEFAULT_ITEMS_PER_PAGE = 8;