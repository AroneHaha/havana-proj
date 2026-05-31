/**
 * Dashboard Service — combined summary endpoint for fast dashboard loading.
 *
 * Architecture:
 *   - Single API call to /admin/dashboard/summary replaces 5 separate calls
 *   - The backend DashboardController returns all stats in one DB connection
 *   - This eliminates the Supabase cold-start penalty for each separate call
 *
 * When NEXT_PUBLIC_API_URL is not set, falls back to calling individual
 * services (mock mode) — same behavior as before.
 */

import { API_BASE, type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";
import type { Order, OrderStats, OrderStatus } from "@/services/orders-service";
import type { Product } from "@/types";
import type { Review, ReviewStats } from "@/types/review";

// ─── Error class ──────────────────────────────────────────────────────

export class DashboardError extends AppError {
  declare code: "NETWORK_ERROR" | "TOKEN_EXPIRED" | "UNKNOWN";

  constructor(
    message: string,
    code: DashboardError["code"],
    fields: FieldErrors = {}
  ) {
    super(message, code, fields);
    this.name = "DashboardError";
  }
}

// ─── Auth-aware fetch ─────────────────────────────────────────────────

const dashboardFetch = createServiceFetch(DashboardError, {
  validationCode: "UNKNOWN",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

// ─── Types (match the store types exactly) ────────────────────────────

export interface DashboardOrderStats {
  totalRevenue: number;
  averageOrderValue: number;
  statusCounts: Record<OrderStatus, number>;
}

export interface DashboardProductStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface DashboardReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface DashboardSummary {
  orders: {
    stats: DashboardOrderStats;
    recent: Order[];
  };
  products: {
    stats: DashboardProductStats;
    alerts: Product[];
  };
  reviews: {
    stats: DashboardReviewStats;
    recent: Review[];
  };
}

// ─── Laravel API response shape ──────────────────────────────────────

interface LaravelDashboardResponse {
  data: {
    orders: {
      stats: {
        total_revenue: string;
        average_order_value: string;
        status_counts: Record<string, number>;
      };
      recent: unknown[];
    };
    products: {
      stats: {
        total_products: number;
        total_value: string;
        low_stock_count: number;
        out_of_stock_count: number;
      };
      alerts: unknown[];
    };
    reviews: {
      stats: {
        average_rating: number;
        total_reviews: number;
        rating_distribution: Record<number, number>;
      };
      recent: unknown[];
    };
  };
}

// ─── Mappers ─────────────────────────────────────────────────────────

import { mapLaravelOrder, type LaravelOrder } from "@/services/orders-service";
import { mapLaravelProduct } from "@/services/product-service";
import { mapLaravelReview } from "@/services/review-service";
import { useLanguageStore } from "@/store/language-store";

function mapDashboardResponse(raw: LaravelDashboardResponse["data"]): DashboardSummary {
  const locale = useLanguageStore.getState().locale;

  return {
    orders: {
      stats: {
        totalRevenue: Number(raw.orders.stats.total_revenue) || 0,
        averageOrderValue: Number(raw.orders.stats.average_order_value) || 0,
        statusCounts: raw.orders.stats.status_counts as Record<OrderStatus, number>,
      },
      recent: (raw.orders.recent as LaravelOrder[]).map(mapLaravelOrder),
    },
    products: {
      stats: {
        totalProducts: raw.products.stats.total_products,
        totalValue: Number(raw.products.stats.total_value) || 0,
        lowStockCount: raw.products.stats.low_stock_count,
        outOfStockCount: raw.products.stats.out_of_stock_count,
      },
      alerts: (raw.products.alerts as any[]).map((p) => mapLaravelProduct(p, locale)),
    },
    reviews: {
      stats: {
        averageRating: raw.reviews.stats.average_rating,
        totalReviews: raw.reviews.stats.total_reviews,
        ratingDistribution: raw.reviews.stats.rating_distribution,
      },
      recent: (raw.reviews.recent as any[]).map(mapLaravelReview),
    },
  };
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Fetch the complete dashboard summary in a single API call.
 * This is the FAST path — 1 DB connection instead of 5+.
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  if (API_BASE) {
    try {
      const response = await dashboardFetch<LaravelDashboardResponse>(
        "/admin/dashboard/summary"
      );
      return mapDashboardResponse(response.data);
    } catch (err) {
      if (err instanceof DashboardError) throw err;
      throw new DashboardError(
        err instanceof Error ? err.message : "Failed to fetch dashboard",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock fallback: use individual services (same as before) ──
  const { fetchOrders, fetchOrderStats } = await import("@/services/orders-service");
  const { getProducts, fetchProductStats } = await import("@/services/product-service");
  const { fetchReviews, fetchReviewStats } = await import("@/services/review-service");

  const [ordersData, orderStatsData, productsData, productStatsData, reviewsData, reviewStatsData] =
    await Promise.all([
      fetchOrders(),
      fetchOrderStats(),
      getProducts("en", 1, 50),
      fetchProductStats(),
      fetchReviews(),
      fetchReviewStats(),
    ]);

  return {
    orders: {
      stats: {
        totalRevenue: orderStatsData.totalRevenue,
        averageOrderValue: orderStatsData.averageOrderValue,
        statusCounts: orderStatsData.statusCounts,
      },
      recent: ordersData.orders.slice(0, 5),
    },
    products: {
      stats: {
        totalProducts: productStatsData.totalProducts,
        totalValue: productStatsData.totalValue,
        lowStockCount: productStatsData.lowStockCount,
        outOfStockCount: productStatsData.outOfStockCount,
      },
      alerts: productsData.products,
    },
    reviews: {
      stats: {
        averageRating: reviewStatsData.averageRating,
        totalReviews: reviewStatsData.totalReviews,
        ratingDistribution: reviewStatsData.ratingDistribution,
      },
      recent: reviewsData.reviews.slice(0, 5),
    },
  };
}
