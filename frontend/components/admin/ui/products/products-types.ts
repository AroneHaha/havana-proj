export type FilterStatus = "all" | "in_stock" | "low_stock" | "sold_out";

export interface AdminProduct {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  categoryId: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: FilterStatus;
  images: string[];
  description: string;
  descriptionAr: string;
  sku: string;
  soldOut: boolean;
  createdAt: string;
}