/**
 * Shared types for the Products admin module.
 *
 * Extracted from products-page.tsx to break the circular dependency:
 *   products-page  →  products-table  →  products-page  (cycle!)
 *
 * All product-related types and constants that are shared across
 * multiple files in this module should live here or in @/lib/constant.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  name: string;
  nameAr: string;
  category: string;       // Category name (for display)
  categoryId: string;     // Category UUID (for API calls)
  price: number;          // Base price (always the original price from the product)
  salePrice?: number;     // Sale price if discounted (undefined = no discount)
  stock: number;
  status: "in_stock" | "low_stock" | "sold_out";
  images: string[];
  description: string;
  sku: string;
  soldOut: boolean;
  createdAt: string;
}

export type FilterStatus = "all" | "in_stock" | "low_stock" | "sold_out";
