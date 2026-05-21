/**
 * Orders Store — Zustand + persist.
 *
 * Architecture:
 *   1. All order data is managed here — single source of truth
 *   2. When Laravel backend is live, replace the sample data
 *      with API calls in each method. The store interface stays the same.
 *   3. `OrderStatus` flow: pending → confirmed → preparing → out_for_delivery → delivered
 *      Also: any active status → cancelled
 *   4. Persisted to localStorage under "havana-orders" key
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cash"; // Cash on Delivery only for now

/** The canonical status flow — each step advances to the next */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

/** Maps status → i18n key under admin.orders */
export const STATUS_I18N_KEY: Record<OrderStatus, string> = {
  pending: "pending",
  confirmed: "confirmed",
  preparing: "preparing",
  out_for_delivery: "outForDelivery",
  delivered: "delivered",
  cancelled: "cancelled",
};

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: Order[];

  // ─── Actions ────────────────────────────────────────────────────────
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  // ─── Derived helpers (methods to avoid re-renders) ──────────────────
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrderById: (id: string) => Order | undefined;
  getTotalRevenue: () => number;
  getActiveOrders: () => Order[];
  getAverageOrderValue: () => number;
  getStatusCounts: () => Record<OrderStatus, number>;
}

// ─── Sample data (Qatar-based luxury floral shop) ────────────────────

const sampleOrders: Order[] = [
  {
    id: "HV-1001",
    customer: { name: "Ahmad Al-Thani", email: "ahmad@email.com", phone: "+974 5551 0001", address: "West Bay, Tower 5, Apt 1203" },
    items: [{ productId: "p1", productName: "Royal Rose Symphony", quantity: 2, price: 699 }],
    subtotal: 1398, deliveryFee: 0, total: 1398, status: "pending", paymentMethod: "cash",
    notes: "Please include a birthday card", createdAt: "2024-12-20T10:30:00", updatedAt: "2024-12-20T10:30:00",
  },
  {
    id: "HV-1002",
    customer: { name: "Sara Mahmoud", email: "sara@email.com", phone: "+974 5552 0002", address: "The Pearl, Porto Arabia, Bldg 12" },
    items: [{ productId: "p4", productName: "Golden Hour Bouquet", quantity: 1, price: 620 }, { productId: "p2", productName: "Midnight Orchid Elegance", quantity: 3, price: 999 }],
    subtotal: 3617, deliveryFee: 0, total: 3617, status: "confirmed", paymentMethod: "cash",
    createdAt: "2024-12-20T09:15:00", updatedAt: "2024-12-20T09:45:00",
  },
  {
    id: "HV-1003",
    customer: { name: "Khalid bin Mohammed", email: "khalid@email.com", phone: "+974 5553 0003", address: "Lusail, Marina District, Villa 45" },
    items: [{ productId: "p3", productName: "Pearl White Lilies", quantity: 1, price: 780 }],
    subtotal: 780, deliveryFee: 30, total: 810, status: "preparing", paymentMethod: "cash",
    createdAt: "2024-12-20T08:00:00", updatedAt: "2024-12-20T08:30:00",
  },
  {
    id: "HV-1004",
    customer: { name: "Fatima Al-Kuwari", email: "fatima@email.com", phone: "+974 5554 0004", address: "Al Sadd, Street 22, House 8" },
    items: [{ productId: "p7", productName: "Classic Red Rose Box", quantity: 1, price: 550 }, { productId: "p5", productName: "Tulip Paradise", quantity: 1, price: 480 }],
    subtotal: 1030, deliveryFee: 30, total: 1060, status: "out_for_delivery", paymentMethod: "cash",
    createdAt: "2024-12-19T14:00:00", updatedAt: "2024-12-20T07:00:00",
  },
  {
    id: "HV-1005",
    customer: { name: "Omar Hassan", email: "omar@email.com", phone: "+974 5555 0005", address: "Al Waab, Al Furousiya St, Bldg 3" },
    items: [{ productId: "p6", productName: "Luxury White & Gold", quantity: 2, price: 899 }],
    subtotal: 1798, deliveryFee: 0, total: 1798, status: "delivered", paymentMethod: "cash",
    createdAt: "2024-12-18T11:00:00", updatedAt: "2024-12-18T16:30:00",
  },
  {
    id: "HV-1006",
    customer: { name: "Noor Al-Emadi", email: "noor@email.com", phone: "+974 5556 0006", address: "Katara Cultural Village, Zone A" },
    items: [{ productId: "p1", productName: "Royal Rose Symphony", quantity: 1, price: 699 }],
    subtotal: 699, deliveryFee: 30, total: 729, status: "delivered", paymentMethod: "cash",
    createdAt: "2024-12-17T13:20:00", updatedAt: "2024-12-17T17:00:00",
  },
  {
    id: "HV-1007",
    customer: { name: "Youssef Ibrahim", email: "youssef@email.com", phone: "+974 5557 0007", address: "Downtown Doha, Al Dafna, Tower 8" },
    items: [{ productId: "p2", productName: "Pastel Dream Arrangement", quantity: 5, price: 580 }],
    subtotal: 2900, deliveryFee: 0, total: 2900, status: "delivered", paymentMethod: "cash",
    createdAt: "2024-12-16T09:00:00", updatedAt: "2024-12-16T14:00:00",
  },
  {
    id: "HV-1008",
    customer: { name: "Layla Al-Thani", email: "layla@email.com", phone: "+974 5558 0008", address: "West Bay, Al Corniche St" },
    items: [{ productId: "p8", productName: "Tulip Paradise", quantity: 1, price: 480 }, { productId: "p3", productName: "Pearl White Lilies", quantity: 1, price: 780 }],
    subtotal: 1260, deliveryFee: 0, total: 1260, status: "cancelled", paymentMethod: "cash",
    notes: "Customer changed mind", createdAt: "2024-12-19T16:00:00", updatedAt: "2024-12-19T18:00:00",
  },
  {
    id: "HV-1009",
    customer: { name: "Hassan Mirza", email: "hassan@email.com", phone: "+974 5559 0009", address: "Al Khor, Pearl Blvd, Villa 12" },
    items: [{ productId: "p5", productName: "Tulip Paradise", quantity: 3, price: 480 }],
    subtotal: 1440, deliveryFee: 30, total: 1470, status: "delivered", paymentMethod: "cash",
    createdAt: "2024-12-15T10:00:00", updatedAt: "2024-12-15T15:00:00",
  },
  {
    id: "HV-1010",
    customer: { name: "Maryam Al-Sayed", email: "maryam@email.com", phone: "+974 5560 0010", address: "The Pearl, Viva Bahriya, Bldg 22" },
    items: [{ productId: "p4", productName: "Golden Hour Bouquet", quantity: 1, price: 620 }],
    subtotal: 620, deliveryFee: 30, total: 650, status: "pending", paymentMethod: "cash",
    notes: "Wedding on Dec 25. Delivery by 8 AM.", createdAt: "2024-12-20T11:00:00", updatedAt: "2024-12-20T11:00:00",
  },
  {
    id: "HV-1011",
    customer: { name: "Aisha Al-Hamad", email: "aisha@email.com", phone: "+974 5561 0011", address: "Al Rayyan, Al Wajba St, Villa 7" },
    items: [{ productId: "p6", productName: "Luxury White & Gold", quantity: 1, price: 899 }, { productId: "p5", productName: "Tulip Paradise", quantity: 2, price: 480 }],
    subtotal: 1859, deliveryFee: 0, total: 1859, status: "pending", paymentMethod: "cash",
    notes: "Surprise delivery — do not call recipient", createdAt: "2024-12-20T12:15:00", updatedAt: "2024-12-20T12:15:00",
  },
  {
    id: "HV-1012",
    customer: { name: "Mohammed Al-Attiyah", email: "mohammed@email.com", phone: "+974 5562 0012", address: "Al Wakrah, Ezdan Oasis, Bldg 9" },
    items: [{ productId: "p1", productName: "Royal Rose Symphony", quantity: 1, price: 699 }],
    subtotal: 699, deliveryFee: 30, total: 729, status: "confirmed", paymentMethod: "cash",
    createdAt: "2024-12-20T13:00:00", updatedAt: "2024-12-20T13:30:00",
  },
];

// ─── Store ────────────────────────────────────────────────────────────

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: sampleOrders,

      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
          ),
        })),

      deleteOrder: (id) =>
        set((state) => ({ orders: state.orders.filter((o) => o.id !== id) })),

      getOrdersByStatus: (status) => get().orders.filter((o) => o.status === status),

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      getTotalRevenue: () =>
        get()
          .orders.filter((o) => o.status === "delivered")
          .reduce((sum, o) => sum + o.total, 0),

      getActiveOrders: () =>
        get().orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled"),

      getAverageOrderValue: () => {
        const delivered = get().orders.filter((o) => o.status === "delivered");
        if (delivered.length === 0) return 0;
        return delivered.reduce((sum, o) => sum + o.total, 0) / delivered.length;
      },

      getStatusCounts: () => {
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
    { name: "havana-orders" }
  )
);
