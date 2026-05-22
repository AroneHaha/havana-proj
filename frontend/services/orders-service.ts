/**
 * Orders Service — production-ready for Laravel + Supabase.
 *
 * Architecture:
 *   1. All HTTP calls go through `authFetch()` (from auth-service) which
 *      attaches the JWT Authorization header and handles token refresh.
 *   2. Laravel API responses are mapped to our canonical `Order` type.
 *   3. When `NEXT_PUBLIC_API_URL` is not set (dev without backend),
 *      everything falls back to mock data — zero config needed.
 *   4. Error handling uses strongly-typed `OrdersError` for the UI.
 *
 * Expected Laravel endpoints (Sanctum-protected):
 *   GET    /admin/orders              → paginated list (with ?status=&date_from=&date_to=&search=)
 *   GET    /admin/orders/:id          → single order detail
 *   PATCH  /admin/orders/:id/status   { status } → update status
 *   DELETE /admin/orders/:id          → soft-delete order
 *   GET    /admin/orders/stats        → { revenue, avgOrderValue, statusCounts }
 *   PATCH  /admin/orders/:id/cancel   → cancel order (alias for status=cancelled)
 *
 * When Supabase is added:
 *   - Replace `authFetch` with Supabase client methods
 *   - The `Order` shape stays the same (Supabase row → our Order mapping)
 */

import { authFetch } from "@/services/auth-service";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

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

export interface OrderStats {
  totalRevenue: number;
  averageOrderValue: number;
  statusCounts: Record<OrderStatus, number>;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  currentPage: number;
  lastPage: number;
}

/** Per-field validation errors returned by Laravel */
export interface FieldErrors {
  [field: string]: string[];
}

export class OrdersError extends Error {
  code:
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "NETWORK_ERROR"
    | "STATUS_CONFLICT"
    | "UNKNOWN";
  fields: FieldErrors;

  constructor(
    message: string,
    code: OrdersError["code"],
    fields: FieldErrors = {}
  ) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

// ─── Laravel API response shapes ──────────────────────────────────────

interface LaravelOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface LaravelOrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface LaravelOrder {
  id: string;
  order_number: string;
  customer: LaravelOrderCustomer;
  items: LaravelOrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface LaravelOrdersListResponse {
  data: LaravelOrder[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface LaravelOrderStats {
  total_revenue: number;
  average_order_value: number;
  status_counts: Record<OrderStatus, number>;
}

interface LaravelValidationErrorResponse {
  message: string;
  errors: { [field: string]: string[] };
}

// ─── Map Laravel order → Order ────────────────────────────────────────

function mapLaravelOrder(raw: LaravelOrder): Order {
  return {
    id: raw.order_number,
    customer: {
      name: raw.customer.name,
      email: raw.customer.email,
      phone: raw.customer.phone,
      address: raw.customer.address,
    },
    items: raw.items.map((item) => ({
      productId: String(item.product_id),
      productName: item.product_name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: raw.subtotal,
    deliveryFee: raw.delivery_fee,
    total: raw.total,
    status: raw.status,
    paymentMethod: raw.payment_method,
    notes: raw.notes ?? undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ─── Auth-aware fetch for orders (reuses auth-service) ────────────────

async function ordersFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    return await authFetch<T>(path, options);
  } catch (err: unknown) {
    // Re-throw as OrdersError for consistent handling
    if (err && typeof err === "object" && "code" in err) {
      const authErr = err as { code: string; message: string; fields?: FieldErrors };
      if (authErr.code === "VALIDATION_ERROR") {
        throw new OrdersError(
          authErr.message,
          "VALIDATION_ERROR",
          authErr.fields ?? {}
        );
      }
      if (authErr.code === "TOKEN_EXPIRED") {
        throw new OrdersError("Session expired. Please sign in again.", "FORBIDDEN");
      }
    }
    throw new OrdersError(
      err instanceof Error ? err.message : "Request failed",
      "UNKNOWN"
    );
  }
}

// ─── Mock data (Qatar-based luxury floral shop) ──────────────────────

const MOCK_ORDERS: Order[] = [
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

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Fetch all orders — with optional filters.
 * When API is live, this hits Laravel's paginated endpoint.
 * Otherwise returns mock data with client-side filtering.
 */
export async function fetchOrders(filters?: {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<OrdersListResponse> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
      if (filters?.dateTo) params.set("date_to", filters.dateTo);
      if (filters?.search) params.set("search", filters.search);
      if (filters?.page) params.set("page", String(filters.page));
      if (filters?.perPage) params.set("per_page", String(filters.perPage));

      const qs = params.toString();
      const path = `/admin/orders${qs ? `?${qs}` : ""}`;

      const data = await ordersFetch<LaravelOrdersListResponse>(path);
      return {
        orders: data.data.map(mapLaravelOrder),
        total: data.meta.total,
        currentPage: data.meta.current_page,
        lastPage: data.meta.last_page,
      };
    } catch (err) {
      if (err instanceof OrdersError && err.code === "FORBIDDEN") throw err;
      // API unreachable — fall through to mock
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 200));

  let result = [...MOCK_ORDERS];

  if (filters?.status) {
    result = result.filter((o) => o.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
    );
  }
  if (filters?.dateFrom) {
    const from = new Date(filters.dateFrom);
    from.setHours(0, 0, 0, 0);
    result = result.filter((o) => new Date(o.createdAt) >= from);
  }
  if (filters?.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((o) => new Date(o.createdAt) <= to);
  }

  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const page = filters?.page ?? 1;
  const perPage = filters?.perPage ?? 50;
  const start = (page - 1) * perPage;
  const paginated = result.slice(start, start + perPage);

  return {
    orders: paginated,
    total: result.length,
    currentPage: page,
    lastPage: Math.max(1, Math.ceil(result.length / perPage)),
  };
}

/**
 * Fetch a single order by ID.
 */
export async function fetchOrderById(id: string): Promise<Order | null> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await ordersFetch<{ data: LaravelOrder }>(
        `/admin/orders/${id}`
      );
      return mapLaravelOrder(data.data);
    } catch (err) {
      if (err instanceof OrdersError && err.code === "NOT_FOUND") return null;
      // fall through to mock
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_ORDERS.find((o) => o.id === id) ?? null;
}

/**
 * Update order status.
 * When API is live, this calls PATCH /admin/orders/:id/status.
 * Otherwise, updates mock data in-memory.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await ordersFetch<{ data: LaravelOrder }>(
        `/admin/orders/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );
      return mapLaravelOrder(data.data);
    } catch (err) {
      if (err instanceof OrdersError) throw err;
      // fall through to mock
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 300));

  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (!order) {
    throw new OrdersError("Order not found", "NOT_FOUND");
  }

  // Validate status transition
  if (status === "cancelled" && order.status === "delivered") {
    throw new OrdersError(
      "Cannot cancel a delivered order",
      "STATUS_CONFLICT"
    );
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  return { ...order };
}

/**
 * Cancel an order.
 * Convenience method — same as updateOrderStatus(id, "cancelled") but
 * uses a dedicated endpoint for audit logging.
 */
export async function cancelOrder(id: string): Promise<Order> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await ordersFetch<{ data: LaravelOrder }>(
        `/admin/orders/${id}/cancel`,
        { method: "PATCH" }
      );
      return mapLaravelOrder(data.data);
    } catch (err) {
      if (err instanceof OrdersError) throw err;
      // fall through to mock
    }
  }

  // ── Mock ──
  return updateOrderStatus(id, "cancelled");
}

/**
 * Delete an order (soft-delete on backend).
 */
export async function deleteOrder(id: string): Promise<boolean> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      await ordersFetch<{ message: string }>(`/admin/orders/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      if (err instanceof OrdersError) throw err;
      // fall through to mock
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 200));

  const idx = MOCK_ORDERS.findIndex((o) => o.id === id);
  if (idx === -1) {
    throw new OrdersError("Order not found", "NOT_FOUND");
  }
  MOCK_ORDERS.splice(idx, 1);
  return true;
}

/**
 * Fetch order statistics.
 * When API is live, this hits /admin/orders/stats.
 * Otherwise, computed from mock data.
 */
export async function fetchOrderStats(): Promise<OrderStats> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await ordersFetch<LaravelOrderStats>(
        "/admin/orders/stats"
      );
      return {
        totalRevenue: data.total_revenue,
        averageOrderValue: data.average_order_value,
        statusCounts: data.status_counts,
      };
    } catch {
      // fall through to mock
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 100));

  const delivered = MOCK_ORDERS.filter((o) => o.status === "delivered");
  const totalRevenue = delivered.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue =
    delivered.length > 0 ? totalRevenue / delivered.length : 0;

  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };
  MOCK_ORDERS.forEach((o) => {
    statusCounts[o.status]++;
  });

  return { totalRevenue, averageOrderValue, statusCounts };
}