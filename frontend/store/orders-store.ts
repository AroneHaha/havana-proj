/**
 * Orders Store — Zustand + persist.
 *
 * Architecture:
 *   1. All order data flows through the orders-service layer.
 *      When NEXT_PUBLIC_API_URL is set → hits Laravel API.
 *      When not set → uses mock data with simulated latency.
 *   2. The store interface stays the same regardless of data source.
 *      Components never import the service directly.
 *   3. `OrderStatus` flow: pending → confirmed → preparing → out_for_delivery → delivered
 *      Also: any active status → cancelled
 *   4. Stats (revenue, counts) are fetched from the service, not
 *      computed client-side — so when the backend goes live the
 *      numbers are authoritative, not approximated from a subset.
 *   5. Persisted to localStorage under "havana-orders" key as a
 *      cache. The store refreshes from the API on mount.
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

// Re-export types and constants so components can import from the store
// (same pattern as auth-store re-exports AuthUser, AuthError, etc.)
export type { Order, OrderStatus, OrdersError, OrderStats };
export type { PaymentMethod };
export { ORDER_STATUS_FLOW, STATUS_I18N_KEY };

interface OrdersState {
  orders: Order[];
  stats: OrderStats | null;
  /** Whether the initial fetch is in progress */
  loading: boolean;
  /** Error from the last failed operation */
  error: string | null;

  // ─── Lifecycle ─────────────────────────────────────────────────────
  /** Fetch orders from service (API or mock). Call on mount. */
  fetchOrders: () => Promise<void>;
  /** Refresh stats from service */
  fetchStats: () => Promise<void>;

  // ─── Actions ────────────────────────────────────────────────────────
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  // ─── Derived helpers (methods to avoid re-renders) ──────────────────
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrderById: (id: string) => Order | undefined;
  getTotalRevenue: () => number;
  getActiveOrders: () => Order[];
  getAverageOrderValue: () => number;
  getStatusCounts: () => Record<OrderStatus, number>;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      stats: null,
      loading: false,
      error: null,

      fetchOrders: async () => {
        set({ loading: true, error: null });
        try {
          const result = await serviceFetchOrders();
          set({ orders: result.orders, loading: false });
        } catch (err) {
          const msg =
            err && typeof err === "object" && "message" in err
              ? (err as { message: string }).message
              : "Failed to fetch orders";
          set({ error: msg, loading: false });
        }
      },

      fetchStats: async () => {
        try {
          const stats = await serviceFetchStats();
          set({ stats });
        } catch {
          // Stats are non-critical — don't set error state
        }
      },

      updateOrderStatus: async (id, status) => {
        try {
          const updated = await serviceUpdateStatus(id, status);
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? updated : o
            ),
          }));
          // Refresh stats after status change
          get().fetchStats();
        } catch (err) {
          const msg =
            err && typeof err === "object" && "message" in err
              ? (err as { message: string }).message
              : "Failed to update order status";
          set({ error: msg });
          throw err; // Re-throw so UI can handle (e.g. toast)
        }
      },

      deleteOrder: async (id) => {
        try {
          await serviceDeleteOrder(id);
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id),
          }));
          // Refresh stats after deletion
          get().fetchStats();
        } catch (err) {
          const msg =
            err && typeof err === "object" && "message" in err
              ? (err as { message: string }).message
              : "Failed to delete order";
          set({ error: msg });
          throw err;
        }
      },

      // ─── Derived helpers (computed from current state) ────────────────

      getOrdersByStatus: (status) => get().orders.filter((o) => o.status === status),

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      getTotalRevenue: () => {
        const { stats } = get();
        if (stats) return stats.totalRevenue;
        return get().orders
          .filter((o) => o.status === "delivered")
          .reduce((sum, o) => sum + o.total, 0);
      },

      getActiveOrders: () =>
        get().orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled"),

      getAverageOrderValue: () => {
        const { stats } = get();
        if (stats) return stats.averageOrderValue;
        const delivered = get().orders.filter((o) => o.status === "delivered");
        if (delivered.length === 0) return 0;
        return delivered.reduce((sum, o) => sum + o.total, 0) / delivered.length;
      },

      getStatusCounts: () => {
        const { stats } = get();
        if (stats) return stats.statusCounts;
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
    }),
    {
      name: "havana-orders",
      // Only persist orders as cache — stats are always re-fetched
      partialize: (state) => ({ orders: state.orders }),
      skipHydration: true,
    }
  )
);
