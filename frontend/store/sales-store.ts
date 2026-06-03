/**
 * Sales Store — Zustand + persist for sales data.
 * Talks to /admin/orders/sales (delivered orders only + server stats).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchSales as serviceFetchSales,
  type Order, type SalesStats, type ProductOption, type SalesError,
} from "@/services/sales-service";
import { getErrorMessage } from "@/lib/get-error-message";

export type { Order, SalesStats, ProductOption, SalesError };

export const SALES_PER_PAGE = 50;

interface PageCacheEntry {
  sales: Order[];
  totalSales: number;
  totalPages: number;
  stats: SalesStats;
  availableYears: number[];
  productOptions: ProductOption[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 10;

export interface SalesFilters {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  productId?: string;
  year?: number;
  month?: number;
}

interface SalesState {
  sales: Order[];
  totalSales: number;
  currentPage: number;
  totalPages: number;
  filters: SalesFilters;
  stats: SalesStats;
  availableYears: number[];
  productOptions: ProductOption[];
  loading: boolean;
  error: string | null;
  fetchSales: (page?: number) => Promise<void>;
  setSalesFilters: (filters: Partial<SalesFilters>) => void;
  clearSalesFilters: () => void;
}

let fetchAbortController: AbortController | null = null;
const pageCache = new Map<string, PageCacheEntry>();

function buildCacheKey(page: number, f: SalesFilters): string {
  return `${page}:${f.dateFrom ?? ""}:${f.dateTo ?? ""}:${f.search ?? ""}:${f.productId ?? ""}:${f.year ?? ""}:${f.month ?? ""}`;
}

function trimCache() {
  if (pageCache.size <= MAX_CACHE_SIZE) return;
  const entries = [...pageCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  for (const [key] of entries.slice(0, entries.length - MAX_CACHE_SIZE)) pageCache.delete(key);
}

const defaultStats: SalesStats = { totalRevenue: 0, totalOrders: 0, productsSold: 0 };

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: [], totalSales: 0, currentPage: 1, totalPages: 1,
      filters: {}, stats: defaultStats, availableYears: [], productOptions: [],
      loading: true, error: null,

      fetchSales: async (page?: number) => {
        const state = get();
        const targetPage = page ?? state.currentPage;
        const filters = state.filters;

        const cacheKey = buildCacheKey(targetPage, filters);
        const cached = pageCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          set({
            sales: cached.sales, totalSales: cached.totalSales, currentPage: targetPage,
            totalPages: cached.totalPages, stats: cached.stats,
            availableYears: cached.availableYears, productOptions: cached.productOptions,
            loading: false,
          });
          return;
        }

        if (fetchAbortController) fetchAbortController.abort();
        fetchAbortController = new AbortController();
        const currentAbort = fetchAbortController;

        set({ loading: !state.sales.length, error: null });

        try {
          const result = await serviceFetchSales({
            page: targetPage, perPage: SALES_PER_PAGE,
            dateFrom: filters.dateFrom, dateTo: filters.dateTo,
            search: filters.search, productId: filters.productId,
            year: filters.year, month: filters.month,
          });

          if (currentAbort.signal.aborted) return;

          pageCache.set(cacheKey, {
            sales: result.orders, totalSales: result.total, totalPages: result.lastPage,
            stats: result.stats, availableYears: result.availableYears,
            productOptions: result.productOptions, timestamp: Date.now(),
          });
          trimCache();

          set({
            sales: result.orders, totalSales: result.total,
            currentPage: result.currentPage, totalPages: result.lastPage,
            stats: result.stats, availableYears: result.availableYears,
            productOptions: result.productOptions, loading: false,
          });
        } catch (err) {
          if (currentAbort.signal.aborted) return;
          set({ error: getErrorMessage(err, "Failed to fetch sales"), loading: false });
        }
      },

      setSalesFilters: (newFilters) => {
        const merged = { ...get().filters, ...newFilters };
        set({ filters: merged, currentPage: 1 });
        pageCache.clear();
        get().fetchSales(1);
      },

      clearSalesFilters: () => {
        set({ filters: {}, currentPage: 1 });
        pageCache.clear();
        get().fetchSales(1);
      },
    }),
    {
      name: "havana-sales",
      partialize: (state) => ({
        sales: state.sales, totalSales: state.totalSales, currentPage: state.currentPage,
        totalPages: state.totalPages, filters: state.filters, stats: state.stats,
        availableYears: state.availableYears, productOptions: state.productOptions,
      }),
      skipHydration: true,
    }
  )
);
