/**
 * Sales Service — dedicated backend endpoint for sales data.
 */

import { type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";
import {
  type Order,
  type LaravelOrder,
  mapLaravelOrder,
} from "@/services/orders-service";

export type { Order } from "@/services/orders-service";

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  productsSold: number;
}

export interface ProductOption {
  id: string;
  name: string;
}

export interface SalesFilters {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  productId?: string;
  year?: number;
  month?: number;
  page?: number;
  perPage?: number;
}

export interface SalesListResponse {
  orders: Order[];
  total: number;
  currentPage: number;
  lastPage: number;
  stats: SalesStats;
  availableYears: number[];
  productOptions: ProductOption[];
}

export class SalesError extends AppError {
  declare code:
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "TOKEN_EXPIRED"
    | "NETWORK_ERROR"
    | "UNKNOWN";

  constructor(message: string, code: SalesError["code"], fields: FieldErrors = {}) {
    super(message, code, fields);
    this.name = "SalesError";
  }
}

interface LaravelSalesResponse {
  data: LaravelOrder[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  stats: { total_revenue: number; total_orders: number; products_sold: number };
  available_years: number[];
  product_options: Array<{ id: string; name: string }>;
}

const salesFetch = createServiceFetch(SalesError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

export async function fetchSales(filters?: SalesFilters): Promise<SalesListResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters?.dateTo) params.set("date_to", filters.dateTo);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.productId) params.set("product_id", filters.productId);
    if (filters?.year) params.set("year", String(filters.year));
    if (filters?.month) params.set("month", String(filters.month));
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.perPage) params.set("per_page", String(filters.perPage));

    const qs = params.toString();
    const path = `/admin/orders/sales${qs ? `?${qs}` : ""}`;

    const data = await salesFetch<LaravelSalesResponse>(path);
    return {
      orders: data.data.map(mapLaravelOrder),
      total: data.meta.total,
      currentPage: data.meta.current_page,
      lastPage: data.meta.last_page,
      stats: {
        totalRevenue: data.stats.total_revenue ?? 0,
        totalOrders: data.stats.total_orders ?? 0,
        productsSold: data.stats.products_sold ?? 0,
      },
      availableYears: data.available_years ?? [],
      productOptions: data.product_options ?? [],
    };
  } catch (err) {
    if (err instanceof SalesError) throw err;
    throw new SalesError(err instanceof Error ? err.message : "Failed to fetch sales", "NETWORK_ERROR");
  }
}