import { create } from "zustand";
import { getProducts } from "@/services/product-service";
import type { Product } from "@/types";

export type ProductStockStatus = "in_stock" | "low_stock" | "sold_out";

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "slug" | "rating" | "reviewCount" | "createdAt">) => void;
  getProductsByStatus: (status: ProductStockStatus) => Product[];
  getLowStockProducts: () => Product[];
  getOutOfStockProducts: () => Product[];
  getTotalValue: () => number;
}

export function getStockStatus(product: Product): ProductStockStatus {
  if (!product.inStock) return "sold_out";
  if (product.reviewCount > 0 && product.reviewCount < 50) return "low_stock";
  return "in_stock";
}

export const useProductsStore = create<ProductsState>()((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { products } = await getProducts("en", 1, 200);
      set({ products, loading: false });
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to fetch products";
      set({ error: msg, loading: false });
    }
  },

  addProduct: (productData) => {
    const id = `prod_${Date.now()}`;
    const name = productData.name;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const newProduct: Product = {
      ...productData,
      id,
      slug,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      products: [newProduct, ...state.products],
    }));
  },

  getProductsByStatus: (status) =>
    get().products.filter((p) => getStockStatus(p) === status),

  getLowStockProducts: () =>
    get().products.filter((p) => getStockStatus(p) === "low_stock"),

  getOutOfStockProducts: () =>
    get().products.filter((p) => getStockStatus(p) === "sold_out"),

  getTotalValue: () =>
    get().products.reduce((sum, p) => sum + (p.salePrice ?? p.price), 0),
}));