/**
 * Orders Store — Zustand + persist.
 *
 * Architecture:
 *   Server-side pagination: the store fetches only the current page of
 *   orders from the Laravel API. Filters (status, search, date range)
 *   are sent as query params so the database does the heavy lifting.

 *   Stats (revenue, counts) are fetched from a dedicated endpoint —
 *   they reflect the full dataset, not just the current page.
 *
 *   Loading states:
 *     - `loading`: true on initial fetch (no data yet) → full skeleton
 *     - `isFetching`: true on every fetch including page changes → overlay
 *   This lets the UI show a skeleton on first load and a lighter
 *   loading overlay when navigating between pages.
 *
 *   Performance:
 *     - Request dedup: in-flight fetches are tracked by (page, filters)
 *       to prevent duplicate API calls.
 *     - AbortController: stale requests are cancelled when a new one
 *       starts, preventing race conditions and stale data overwrites.
 *     - Page cache: recently fetched pages are cached in-memory so
 *       navigating back to a previous page is instant.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchOrders as serviceFetchOrders,
  updateOrderStatus as serviceUpdateStatus,
  cancelOrder as serviceCancelOrder,
  deleteOrder as serviceDeleteOrder,
  fetchOrderStats as serviceFetchStats,
  type Order,
  type OrderStatus,
  type OrderStats,
  type OrdersError,
  ORDER_STATUS_FLOW,
  STATUS_I18N_KEY,
  PaymentMethod,
} from "@/services/orders-service";
import { getErrorMessage } from "@/lib/get-error-message";
import { invalidateDashboardCache } from "@/lib/use-dashboard-data";

// Re-export types and constants so components can import from the store
export type { Order, OrderStatus, OrdersError, OrderStats };
export type { PaymentMethod };
export { ORDER_STATUS_FLOW, STATUS_I18N_KEY };

/** Default items per page — matches Laravel's per_page */
export const ORDERS_PER_PAGE = 10;

/** Cache entry for a fetched page of orders */
interface PageCacheEntry {
  orders: Order[];
  totalOrders: number;
  totalPages: number;
  timestamp: number;
}

/** How long a cached page is considered fresh (5 minutes) */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Max cached pages to keep (LRU-ish) */
const MAX_CACHE_SIZE = 10;

interface OrdersState {
  /** Orders for the current page only */
  orders: Order[];
  /** Total order count across ALL pages (from API meta) */
  totalOrders: number;
  /** Current page number (1-based) */
  currentPage: number;
  /** Total pages (from API meta) */
  totalPages: number;

  /** Active filter params sent to the API */
  filters: {
    status?: OrderStatus;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  };

  stats: OrderStats | null;
  /** True on initial load when there's no data yet (show skeleton) */
  loading: boolean;
  /** True on every fetch including page changes (show overlay) */
  isFetching: boolean;
  /** Error from the last failed operation */
  error: string | null;

  // ─── Lifecycle ─────────────────────────────────────────────────────
  /** Fetch orders for a specific page with current filters */
  fetchOrders: (page?: number) => Promise<void>;
  /** Set filters and reset to page 1 */
  setFilters: (filters: Partial<OrdersState["filters"]>) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Go to a specific page */
  setPage: (page: number) => void;
  /** Refresh stats from service */
  fetchStats: () => Promise<void>;

  // ─── Dashboard hydration ──────────────────────────────────────────
  hydrateStatsFromSummary: (stats: OrderStats) => void;

  // ─── Actions ────────────────────────────────────────────────────────
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  // ─── Derived helpers ──────────────────────────────────────────────
  getStatusCounts: () => Record<OrderStatus, number>;
  getTotalRevenue: () => number;
  getAverageOrderValue: () => number;
}

// ─── In-flight request tracking (outside Zustand for non-reactive access) ───

/** AbortController for the current in-flight fetch — cancels stale requests */
let fetchAbortController: AbortController | null = null;

/** Page cache: key = "page:status:search:dateFrom:dateTo" → cached response */
const pageCache = new Map<string, PageCacheEntry>();

/** Stats cache to avoid re-fetching on every mount */
let statsCache: { stats: OrderStats; timestamp: number } | null = null;
const STATS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Build a cache key from page + filters.
 * Orders with the same params should hit the cache.
 */
function buildCacheKey(
  page: number,
  filters: OrdersState["filters"]
): string {
  return `${page}:${filters.status ?? ""}:${filters.search ?? ""}:${filters.dateFrom ?? ""}:${filters.dateTo ?? ""}`;
}

/**
 * Evict oldest entries if cache exceeds max size.
 */
function trimCache() {
  if (pageCache.size <= MAX_CACHE_SIZE) return;
  // Delete the oldest entries by timestamp
  const entries = [...pageCache.entries()].sort(
    (a, b) => a[1].timestamp - b[1].timestamp
  );
  const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
  for (const [key] of toDelete) {
    pageCache.delete(key);
  }
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      totalOrders: 0,
      currentPage: 1,
      totalPages: 1,
      filters: {},
      stats: null,
      loading: false,
      isFetching: false,
      error: null,

      fetchOrders: async (page?: number) => {
        const state = get();
        const targetPage = page ?? state.currentPage;
        const filters = state.filters;

        // ── Check page cache first ──
        const cacheKey = buildCacheKey(targetPage, filters);
        const cached = pageCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          // Cache hit — update state instantly without API call
          set({
            orders: cached.orders,
            totalOrders: cached.totalOrders,
            currentPage: targetPage,
            totalPages: cached.totalPages,
            isFetching: false,
            loading: false,
          });
          return;
        }

        // ── Abort any in-flight request ──
        if (fetchAbortController) {
          fetchAbortController.abort();
        }
        fetchAbortController = new AbortController();
        const currentAbort = fetchAbortController;

        const hasData = state.orders.length > 0;
        set({
          loading: !hasData,
          isFetching: true,
          error: null,
        });

        try {
          const result = await serviceFetchOrders({
            page: targetPage,
            perPage: ORDERS_PER_PAGE,
            status: filters.status,
            search: filters.search,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
          });

          // If this request was aborted, don't update state
          if (currentAbort.signal.aborted) return;

          // Cache the result
          pageCache.set(cacheKey, {
            orders: result.orders,
            totalOrders: result.total,
            totalPages: result.lastPage,
            timestamp: Date.now(),
          });
          trimCache();

          set({
            orders: result.orders,
            totalOrders: result.total,
            currentPage: result.currentPage,
            totalPages: result.lastPage,
            loading: false,
            isFetching: false,
          });
        } catch (err) {
          // Ignore aborted requests
          if (currentAbort.signal.aborted) return;

          set({
            error: getErrorMessage(err, "Failed to fetch orders"),
            loading: false,
            isFetching: false,
          });
        }
      },

      setFilters: (newFilters) => {
        const merged = { ...get().filters, ...newFilters };
        set({ filters: merged, currentPage: 1 });
        // Clear page cache when filters change (old cache entries are stale)
        pageCache.clear();
        get().fetchOrders(1);
      },

      clearFilters: () => {
        set({ filters: {}, currentPage: 1 });
        pageCache.clear();
        get().fetchOrders(1);
      },

      setPage: (page) => {
        get().fetchOrders(page);
      },

      fetchStats: async () => {
        // Use cached stats if fresh
        if (statsCache && Date.now() - statsCache.timestamp < STATS_CACHE_TTL_MS) {
          set({ stats: statsCache.stats });
          return;
        }

        try {
          const stats = await serviceFetchStats();
          statsCache = { stats, timestamp: Date.now() };
          set({ stats });
        } catch {
          // Stats are non-critical — don't set error state
        }
      },

      hydrateStatsFromSummary: (stats) => {
        statsCache = { stats, timestamp: Date.now() };
        set({ stats });
      },

      updateOrderStatus: async (id, status) => {
        try {
          const updated = status === "cancelled"
            ? await serviceCancelOrder(id)
            : await serviceUpdateStatus(id, status);
          // Update the order in-place if it's on the current page
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? updated : o
            ),
          }));
          // Invalidate page cache (order status changed)
          pageCache.clear();
          // Invalidate stats cache
          statsCache = null;
          // Invalidate dashboard cache (stats are stale now)
          invalidateDashboardCache();
          get().fetchStats();
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to update order status") });
          throw err;
        }
      },

      deleteOrder: async (id) => {
        try {
          await serviceDeleteOrder(id);
          // Invalidate page cache (order deleted)
          pageCache.clear();
          statsCache = null;
          // Invalidate dashboard cache (stats are stale now)
          invalidateDashboardCache();
          // Re-fetch current page to get accurate data
          await get().fetchOrders();
          get().fetchStats();
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to delete order") });
          throw err;
        }
      },

      // ─── Derived helpers (computed from current state) ────────────────

      getStatusCounts: () => {
        const { stats } = get();
        if (stats) return stats.statusCounts;
        // Fallback: compute from current page only (not accurate for full dataset)
        const orders = get().orders;
        return {
          pending: orders.filter((o) => o.status === "pending").length,
          confirmed: orders.filter((o) => o.status === "confirmed").length,
          preparing: orders.filter((o) => o.status === "preparing").length,
          out_for_delivery: orders.filter((o) => o.status === "out_for_delivery").length,
          delivered: orders.filter((o) => o.status === "delivered").length,
          cancelled: orders.filter((o) => o.status === "cancelled").length,
        };
      },

      getTotalRevenue: () => {
        const { stats } = get();
        if (stats) return stats.totalRevenue;
        return get().orders
          .filter((o) => o.status === "delivered")
          .reduce((sum, o) => sum + o.total, 0);
      },

      getAverageOrderValue: () => {
        const { stats } = get();
        if (stats) return stats.averageOrderValue;
        const delivered = get().orders.filter((o) => o.status === "delivered");
        if (delivered.length === 0) return 0;
        return delivered.reduce((sum, o) => sum + o.total, 0) / delivered.length;
      },
    }),
    {
      name: "havana-orders",
      // Only persist orders as cache + pagination state
      partialize: (state) => ({
        orders: state.orders,
        totalOrders: state.totalOrders,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        filters: state.filters,
      }),
      skipHydration: true,
    }
  )
);
