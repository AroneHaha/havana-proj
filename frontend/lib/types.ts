
// ─── Product types (used by products-page) ─────────────────────────────

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  images: string[];
  description: string;
  sku: string;
  soldOut: boolean;
  createdAt: string;
}

export type ProductStatus = "in_stock" | "low_stock" | "sold_out";

export type ProductFilterStatus = "all" | ProductStatus;

// ─── Filter helper types ────────────────────────────────────────────────
export type FilterStatus<T extends string> = "all" | T;
