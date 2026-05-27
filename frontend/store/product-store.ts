/**
 * Products Store — Zustand + persist.
 *
 * Architecture:
 *   1. All product data flows through the product-service layer.
 *      When NEXT_PUBLIC_API_URL is set → hits Laravel API.
 *      When not set → uses mock data with simulated latency.
 *   2. The store interface stays the same regardless of data source.
 *      Components never import the service directly.
 *   3. Stats (total value, stock counts) are fetched from the service,
 *      not computed client-side — so when the backend goes live the
 *      numbers are authoritative.
 *   4. Persisted to localStorage under "havana-products" key as a cache.
 *      The store refreshes from the API on mount.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getProducts as serviceGetProducts,
  createProduct as serviceCreateProduct,
  updateProduct as serviceUpdateProduct,
  deleteProduct as serviceDeleteProduct,
  fetchProductStats as serviceFetchStats,
  type ProductsError,
  type ProductStats,
} from "@/services/product-service";
import type { Product } from "@/types";
import { getErrorMessage } from "@/lib/get-error-message";

// Re-export types so components can import from the store
export type { ProductsError, ProductStats };

export type ProductStockStatus = "in_stock" | "low_stock" | "sold_out";

interface ProductsState {
  products: Product[];
  stats: ProductStats | null;
  loading: boolean;
  error: string | null;

  // ─── Lifecycle ─────────────────────────────────────────────────────
  /** Fetch products from service (API or mock). Call on mount. */
  fetchProducts: () => Promise<void>;
  /** Refresh stats from service */
  fetchStats: () => Promise<void>;

  // ─── Actions ────────────────────────────────────────────────────────
  addProduct: (product: Omit<Product, "id" | "slug" | "rating" | "reviewCount" | "createdAt">, rawFiles?: File[]) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>, rawFiles?: File[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // ─── Derived helpers (methods to avoid re-renders) ──────────────────
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

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: [],
      stats: null,
      loading: false,
      error: null,

      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          // Rehydrate from localStorage first (cache), then refresh from API
          useProductsStore.persist.rehydrate();
          const { products } = await serviceGetProducts("en", 1, 200);
          set({ products, loading: false });
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to fetch products"), loading: false });
        }
      },

      fetchStats: async () => {
        try {
          const stats = await serviceFetchStats();
          set({ stats });
        } catch {
          // Stats are non-critical
        }
      },

      addProduct: async (productData, rawFiles) => {
        try {
          const newProduct = await serviceCreateProduct(productData, "en", rawFiles);
          set((state) => ({
            products: [newProduct, ...state.products],
          }));
          get().fetchStats();
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to create product") });
          throw err;
        }
      },

      updateProduct: async (id, data, rawFiles) => {
        try {
          const updated = await serviceUpdateProduct(id, data, "en", rawFiles);
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? updated : p
            ),
          }));
          get().fetchStats();
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to update product") });
          throw err;
        }
      },

      deleteProduct: async (id) => {
        try {
          await serviceDeleteProduct(id);
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          }));
          get().fetchStats();
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to delete product") });
          throw err;
        }
      },

      // ─── Derived helpers (computed from current state) ────────────────

      getProductsByStatus: (status) =>
        get().products.filter((p) => getStockStatus(p) === status),

      getLowStockProducts: () =>
        get().products.filter((p) => getStockStatus(p) === "low_stock"),

      getOutOfStockProducts: () =>
        get().products.filter((p) => getStockStatus(p) === "sold_out"),

      getTotalValue: () => {
        const { stats } = get();
        if (stats) return stats.totalValue;
        return get().products.reduce(
          (sum, p) => sum + (p.salePrice ?? p.price) * p.stock,
          0
        );
      },
    }),
    {
      name: "havana-products",
      // Only persist products as cache — stats are always re-fetched
      partialize: (state) => ({ products: state.products }),
      skipHydration: true,
    }
  )
);
