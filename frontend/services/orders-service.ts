/**
 * Orders Service — production-ready for Laravel + Supabase.
 *
 * Architecture:
 *   1. All HTTP calls go through `authFetch()` (from auth-service) which
 *      attaches the JWT Authorization header and handles token refresh.
 *   2. Laravel API responses are mapped to our canonical `Order` type.
 *   3. Error handling uses strongly-typed `OrdersError` for the UI.
 *
 * Expected Laravel endpoints (Sanctum-protected):
 *   GET    /admin/orders              → paginated list (with ?status=&date_from=&date_to=&search=)
 *   GET    /admin/orders/:id          → single order detail
 *   PATCH  /admin/orders/:id/status   { status } → update status
 *   DELETE /admin/orders/:id          → soft-delete order
 *   GET    /admin/orders/stats        → { revenue, avgOrderValue, statusCounts }
 *   PATCH  /admin/orders/:id/cancel   → cancel order (alias for status=cancelled)
 */

import { type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";
import { type OrderStatus } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────

// Re-export OrderStatus from @/types for backward compatibility
// (consumers importing from this service still work)
export type { OrderStatus } from "@/types";

/** Havana only supports cash on delivery — matches Laravel `cash_on_delivery` value */
export type PaymentMethod = "cash_on_delivery";

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
  /** Display order number (e.g. "HV-1001") — shown to users */
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
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

// FieldErrors is now imported from lib/api-config
export type { FieldErrors };

export class OrdersError extends AppError {
  declare code:
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "TOKEN_EXPIRED"
    | "NETWORK_ERROR"
    | "STATUS_CONFLICT"
    | "UNKNOWN";

  constructor(
    message: string,
    code: OrdersError["code"],
    fields: FieldErrors = {}
  ) {
    super(message, code, fields);
    this.name = "OrdersError";
  }
}

// ─── Laravel API response shapes ──────────────────────────────────────

interface LaravelOrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

/**
 * The ACTUAL shape returned by the backend's Admin\OrderResource.
 * The backend uses shipping_address/shipping_phone/shipping_cost
 * and nests user info in a user object, NOT a flat customer object.
 */
export interface LaravelOrder {
  id: string;
  user_id?: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status?: string;
  shipping_address: string;
  shipping_phone: string;
  notes: string | null;
  is_paid?: boolean;
  is_delivered?: boolean;
  is_cancelled?: boolean;
  // Backend nests user as a UserResource object
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string | null;
  } | null;
  items: LaravelOrderItem[];
  status_history?: Array<{
    id: string;
    status: string;
    changed_by?: string;
    note?: string | null;
    created_at: string;
  }>;
  confirmed_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
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

/** Backend respondWithStats() wraps in { data: {...} } */
interface LaravelOrderStatsResponse {
  data: LaravelOrderStats;
}

// LaravelValidationErrorResponse is now imported from lib/api-config

// ─── Map Laravel order → Order ────────────────────────────────────────

export function mapLaravelOrder(raw: LaravelOrder): Order {
  // Build customer from the backend's user object + shipping fields
  // Backend Admin\OrderResource has: user.first_name, user.last_name, user.email,
  // user.phone, shipping_address, shipping_phone
  const user = raw.user;
  const customerName = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    : 'Unknown Customer';

  return {
    id: String(raw.id),
    orderNumber: raw.order_number,
    customer: {
      name: customerName,
      email: user?.email ?? '',
      phone: raw.shipping_phone ?? user?.phone ?? '',
      address: raw.shipping_address ?? '',
    },
    items: raw.items.map((item) => ({
      productId: String(item.product_id),
      productName: item.product_name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: raw.subtotal,
    discount: raw.discount ?? 0,
    deliveryFee: raw.shipping_cost,
    total: raw.total,
    status: raw.status,
    paymentMethod: raw.payment_method,
    notes: raw.notes ?? undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ─── Auth-aware fetch for orders (reuses auth-service) ────────────────

const ordersFetch = createServiceFetch(OrdersError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Fetch all orders — with optional filters.
 */
export async function fetchOrders(filters?: {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<OrdersListResponse> {
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
    if (err instanceof OrdersError) throw err;
    throw new OrdersError(
      err instanceof Error ? err.message : "Failed to fetch orders",
      "NETWORK_ERROR"
    );
  }
}

/**
 * Fetch a single order by ID.
 */
export async function fetchOrderById(id: string): Promise<Order | null> {
  try {
    const data = await ordersFetch<{ data: LaravelOrder }>(
      `/admin/orders/${id}`
    );
    return mapLaravelOrder(data.data);
  } catch (err) {
    if (err instanceof OrdersError && err.code === "NOT_FOUND") return null;
    if (err instanceof OrdersError) throw err;
    throw new OrdersError(
      err instanceof Error ? err.message : "Failed to fetch order",
      "NETWORK_ERROR"
    );
  }
}

/**
 * Update order status.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
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
    throw new OrdersError(
      err instanceof Error ? err.message : "Failed to update order status",
      "NETWORK_ERROR"
    );
  }
}

/**
 * Cancel an order.
 * Convenience method — same as updateOrderStatus(id, "cancelled") but
 * uses a dedicated endpoint for audit logging.
 */
export async function cancelOrder(id: string): Promise<Order> {
  try {
    const data = await ordersFetch<{ data: LaravelOrder }>(
      `/admin/orders/${id}/cancel`,
      { method: "PATCH" }
    );
    return mapLaravelOrder(data.data);
  } catch (err) {
    if (err instanceof OrdersError) throw err;
    throw new OrdersError(
      err instanceof Error ? err.message : "Failed to cancel order",
      "NETWORK_ERROR"
    );
  }
}

/**
 * Delete an order (soft-delete on backend).
 */
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await ordersFetch<{ message: string }>(`/admin/orders/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (err) {
    if (err instanceof OrdersError) throw err;
    throw new OrdersError(
      err instanceof Error ? err.message : "Failed to delete order",
      "NETWORK_ERROR"
    );
  }
}

/**
 * Fetch order statistics.
 */
export async function fetchOrderStats(): Promise<OrderStats> {
  try {
    const response = await ordersFetch<LaravelOrderStatsResponse>(
      "/admin/orders/stats"
    );
    // Backend respondWithStats() wraps in { data: {...} }
    const data = response.data;
    return {
      totalRevenue: data.total_revenue ?? 0,
      averageOrderValue: data.average_order_value ?? 0,
      statusCounts: data.status_counts ?? { pending: 0, confirmed: 0, preparing: 0, out_for_delivery: 0, delivered: 0, cancelled: 0 },
    };
  } catch (err) {
    if (err instanceof OrdersError) throw err;
    throw new OrdersError(
      err instanceof Error ? err.message : "Failed to fetch order stats",
      "NETWORK_ERROR"
    );
  }
}