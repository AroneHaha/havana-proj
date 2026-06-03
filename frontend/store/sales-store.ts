/**
 * Sales Store — Zustand + persist for the Sales & Reviews page.
 *
 * This store fetches delivered orders from the dedicated /admin/orders/sales
 * endpoint. Unlike the generic orders-store which handles ALL orders,
 * this store is purpose-built for the sales dashboard:
 *
 *   - Fetches only delivered orders
 *   - Gets server-computed stats (revenue, order count, products sold)
 *   - Gets filter options (years, products) from the server
 *   - Server-side filtering + pagination (single source of truth)
 *
 * Architecture mirrors orders-store for consistency:
 *   - Request dedup via in-flight tracking
 *   - AbortController for stale request cancellation
 *   - Page cache for fast back-navigation
 *   - Persist to localStorage for instant stale-while-revalidate
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchSales,
  type SalesStats,
  type SalesFilterOptions,
  type SalesListResponse,
} from "@/services/sales-service";
import type { Order } from "@/services/orders-service";
import { getErrorMessage } from "@/lib/get-error-message";

// ─── Constants ────────────────────────────────────────────────────────

/** Default items per page for the sales table */
export const SALES_PER_PAGE = 8;

/** Cache TTL — 5 minutes */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Max cached pages */
const MAX_CACHE_SIZE = 10;

// ─── Cache types ──────────────────────────────────────────────────────

interface PageCacheEntry {
  response: SalesListResponse;
  timestamp: number;
}

// ─── State shape ──────────────────────────────────────────────────────

export interface SalesFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  year?: number;
  month?: number;
  productId?: string;
}

interface SalesState {
  // Data
  orders: Order[];
  stats: SalesStats | null;
  filterOptions: SalesFilterOptions;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalOrders: number;

  // Filters
  filters: SalesFilters;

  // Loading
  loading: boolean;
  isFetching: boolean;
  error: string | null;

  // Actions
  fetchSales: (page?: number) => Promise<void>;
  setFilters: (filters: Partial<SalesFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
}

// ─── In-flight tracking (outside Zustand) ─────────────────────────────

let fetchAbortController: AbortController | null = null;
const pageCache = new Map<string, PageCacheEntry>();

function buildCacheKey(page: number, filters: SalesFilters): string {
  return `${page}:${filters.search ?? ""}:${filters.dateFrom ?? ""}:${filters.dateTo ?? ""}:${filters.year ?? ""}:${filters.month ?? ""}:${filters.productId ?? ""}`;
}

function trimCache() {
  if (pageCache.size <= MAX_CACHE_SIZE) return;
  const entries = [...pageCache.entries()].sort(
    (a, b) => a[1].timestamp - b[1].timestamp
  );
  for (const [key] of entries.slice(0, entries.length - MAX_CACHE_SIZE)) {
    pageCache.delete(key);
  }
}

// ─── Store ────────────────────────────────────────────────────────────

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      orders: [],
      stats: null,
      filterOptions: { availableYears: [], productOptions: [] },

      currentPage: 1,
      totalPages: 1,
      totalOrders: 0,

      filters: {},

      loading: false,
      isFetching: false,
      error: null,

      fetchSales: async (page?: number) => {
        const state = get();
        const targetPage = page ?? state.currentPage;

        // Cache check
        const cacheKey = buildCacheKey(targetPage, state.filters);
        const cached = pageCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          const resp = cached.response;
          set({
            orders: resp.orders,
            stats: resp.stats,
            filterOptions: resp.filterOptions,
            totalOrders: resp.total,
            currentPage: resp.currentPage,
            totalPages: resp.lastPage,
            loading: false,
            isFetching: false,
          });
          return;
        }

        // Abort stale request
        if (fetchAbortController) fetchAbortController.abort();
        fetchAbortController = new AbortController();
        const currentAbort = fetchAbortController;

        const hasData = state.orders.length > 0;
        set({ loading: !hasData, isFetching: true, error: null });

        try {
          const result = await fetchSales({
            page: targetPage,
            perPage: SALES_PER_PAGE,
            search: state.filters.search,
            dateFrom: state.filters.dateFrom,
            dateTo: state.filters.dateTo,
            year: state.filters.year,
            month: state.filters.month,
            productId: state.filters.productId,
          });

          if (currentAbort.signal.aborted) return;

          // Cache
          pageCache.set(cacheKey, { response: result, timestamp: Date.now() });
          trimCache();

          set({
            orders: result.orders,
            stats: result.stats,
            filterOptions: result.filterOptions,
            totalOrders: result.total,
            currentPage: result.currentPage,
            totalPages: result.lastPage,
            loading: false,
            isFetching: false,
          });
        } catch (err) {
          if (currentAbort.signal.aborted) return;
          set({
            error: getErrorMessage(err, "Failed to fetch sales"),
            loading: false,
            isFetching: false,
          });
        }
      },

      setFilters: (newFilters) => {
        const merged = { ...get().filters, ...newFilters };
        set({ filters: merged, currentPage: 1 });
        pageCache.clear();
        get().fetchSales(1);
      },

      clearFilters: () => {
        set({ filters: {}, currentPage: 1 });
        pageCache.clear();
        get().fetchSales(1);
      },

      setPage: (page) => {
        get().fetchSales(page);
      },
    }),
    {
      name: "havana-sales",
      partialize: (state) => ({
        orders: state.orders,
        stats: state.stats,
        filterOptions: state.filterOptions,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalOrders: state.totalOrders,
        filters: state.filters,
      }),
      skipHydration: true,
    }
  )
);
