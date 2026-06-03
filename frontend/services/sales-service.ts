/**
 * Sales Service — dedicated service for the Sales & Reviews page.
 *
 * Calls GET /admin/orders/sales which returns ONLY delivered orders
 * along with computed stats (total_revenue, total_orders, products_sold),
 * available filter years, and product options.
 *
 * This is separate from orders-service.ts because the sales page needs:
 *   - Only delivered orders (not all orders)
 *   - Server-side computed stats
 *   - Filter dropdowns (years, products) populated from the server
 */

import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";
import type { Order, OrderItem, OrderCustomer, OrderStatus } from "@/services/orders-service";

// ─── Error Class ──────────────────────────────────────────────────────

export class SalesError extends AppError {
  declare code:
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "TOKEN_EXPIRED"
    | "NETWORK_ERROR"
    | "UNKNOWN";

  constructor(message: string, code: SalesError["code"], fields = {}) {
    super(message, code, fields);
    this.name = "SalesError";
  }
}

// ─── Types ──────────────────────────────────────────────────────────────

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  productsSold: number;
}

export interface SalesFilterOptions {
  availableYears: number[];
  productOptions: { id: string; name: string }[];
}

export interface SalesListResponse {
  orders: Order[];
  total: number;
  currentPage: number;
  lastPage: number;
  stats: SalesStats;
  filterOptions: SalesFilterOptions;
}

// ─── Laravel response shape ────────────────────────────────────────────

interface LaravelSalesResponse {
  data: Array<{
    id: string;
    user_id?: string;
    order_number: string;
    status: OrderStatus;
    subtotal: number;
    shipping_cost: number;
    discount: number;
    total: number;
    payment_method: string;
    shipping_address: string;
    shipping_phone: string;
    notes: string | null;
    user?: {
      id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string | null;
    } | null;
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
    }>;
    created_at: string;
    updated_at: string;
  }>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total_revenue: number;
    total_orders: number;
    products_sold: number;
  };
  available_years: number[];
  product_options: Array<{ id: string; name: string }>;
}

// ─── Map Laravel response → Order ──────────────────────────────────────

function mapSalesOrder(raw: LaravelSalesResponse["data"][0]): Order {
  const user = raw.user;
  return {
    id: String(raw.id),
    orderNumber: raw.order_number,
    customer: {
      name: user
        ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
        : "Unknown Customer",
      email: user?.email ?? "",
      phone: raw.shipping_phone ?? user?.phone ?? "",
      address: raw.shipping_address ?? "",
    },
    items: raw.items.map((item) => ({
      productId: String(item.product_id),
      productName: item.product_name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: raw.subtotal,
    deliveryFee: raw.shipping_cost,
    discount: raw.discount ?? 0,
    total: raw.total,
    status: raw.status,
    paymentMethod: raw.payment_method as Order["paymentMethod"],
    notes: raw.notes ?? undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ─── Auth-aware fetch ──────────────────────────────────────────────────

const salesFetch = createServiceFetch(SalesError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Fetch sales data — delivered orders with stats and filter options.
 */
export async function fetchSales(filters?: {
  dateFrom?: string;
  dateTo?: string;
  year?: number;
  month?: number;
  productId?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<SalesListResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters?.dateTo) params.set("date_to", filters.dateTo);
    if (filters?.year) params.set("year", String(filters.year));
    if (filters?.month) params.set("month", String(filters.month));
    if (filters?.productId) params.set("product_id", filters.productId);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.perPage) params.set("per_page", String(filters.perPage));

    const qs = params.toString();
    const path = `/admin/orders/sales${qs ? `?${qs}` : ""}`;

    const data = await salesFetch<LaravelSalesResponse>(path);

    return {
      orders: data.data.map(mapSalesOrder),
      total: data.meta.total,
      currentPage: data.meta.current_page,
      lastPage: data.meta.last_page,
      stats: {
        totalRevenue: data.stats.total_revenue ?? 0,
        totalOrders: data.stats.total_orders ?? 0,
        productsSold: data.stats.products_sold ?? 0,
      },
      filterOptions: {
        availableYears: data.available_years ?? [],
        productOptions: data.product_options ?? [],
      },
    };
  } catch (err) {
    if (err instanceof SalesError) throw err;
    throw new SalesError(
      err instanceof Error ? err.message : "Failed to fetch sales",
      "NETWORK_ERROR"
    );
  }
}