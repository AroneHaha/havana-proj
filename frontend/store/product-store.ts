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
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductsByStatus: (status: ProductStockStatus) => Product[];
  getLowStockProducts: () => Product[];
  getOutOfStockProducts: () => Product[];
  getTotalValue: () => number;
}

export function getStockStatus(product: Product): ProductStockStatus {
  if (product.stock <= 0) return "sold_out";
  if (product.stock < 10) return "low_stock";
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
    const stock = productData.stock ?? 0;
    const newProduct: Product = {
      ...productData,
      id,
      slug,
      inStock: stock > 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      products: [newProduct, ...state.products],
    }));
  },

  updateProduct: (id, data) => {
    set((state) => ({
      products: state.products.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...data };
        updated.inStock = updated.stock > 0;
        return updated;
      }),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  getProductsByStatus: (status) =>
    get().products.filter((p) => getStockStatus(p) === status),

  getLowStockProducts: () =>
    get().products.filter((p) => getStockStatus(p) === "low_stock"),

  getOutOfStockProducts: () =>
    get().products.filter((p) => getStockStatus(p) === "sold_out"),

  getTotalValue: () =>
    get().products.reduce((sum, p) => sum + (p.salePrice ?? p.price) * p.stock, 0),
}));