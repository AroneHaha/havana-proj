/**
 * Orders Store — Zustand + persist.
 *
 * Architecture:
 *   Server-side pagination: the store fetches only the current page of
 *   orders from the Laravel API. Filters (status, search, date range)
 *   are sent as query params so the database does the heavy lifting.
 *   When NEXT_PUBLIC_API_URL is not set → uses mock data with
 *   client-side filtering/pagination as fallback.
 *
 *   Stats (revenue, counts) are fetched from a dedicated endpoint —
 *   they reflect the full dataset, not just the current page.
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

// Re-export types and constants so components can import from the store
export type { Order, OrderStatus, OrdersError, OrderStats };
export type { PaymentMethod };
export { ORDER_STATUS_FLOW, STATUS_I18N_KEY };

/** Default items per page — matches Laravel's per_page */
export const ORDERS_PER_PAGE = 10;

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
  /** Whether a fetch is in progress */
  loading: boolean;
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
      error: null,

      fetchOrders: async (page?: number) => {
        const state = get();
        const targetPage = page ?? state.currentPage;

        // SWR: If we already have data, fetch in background without spinner
        const hasData = state.orders.length > 0;
        if (!hasData) set({ loading: true, error: null });

        try {
          const result = await serviceFetchOrders({
            page: targetPage,
            perPage: ORDERS_PER_PAGE,
            status: state.filters.status,
            search: state.filters.search,
            dateFrom: state.filters.dateFrom,
            dateTo: state.filters.dateTo,
          });
          set({
            orders: result.orders,
            totalOrders: result.total,
            currentPage: result.currentPage,
            totalPages: result.lastPage,
            loading: false,
          });
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to fetch orders"), loading: false });
        }
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1,
        }));
        // Fetch page 1 with new filters
        get().fetchOrders(1);
      },

      clearFilters: () => {
        set({ filters: {}, currentPage: 1 });
        get().fetchOrders(1);
      },

      setPage: (page) => {
        set({ currentPage: page });
        get().fetchOrders(page);
      },

      fetchStats: async () => {
        try {
          const stats = await serviceFetchStats();
          set({ stats });
        } catch {
          // Stats are non-critical — don't set error state
        }
      },

      hydrateStatsFromSummary: (stats) => {
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
          // Refresh stats after status change
          get().fetchStats();
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to update order status") });
          throw err;
        }
      },

      deleteOrder: async (id) => {
        try {
          await serviceDeleteOrder(id);
          // Re-fetch current page to get accurate data
          await get().fetchOrders();
          // Refresh stats after deletion
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
