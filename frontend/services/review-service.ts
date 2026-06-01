/**
 * Review Service — production-ready for Laravel API.
 *
 * Architecture:
 *   1. All HTTP calls go through `authFetch()` (from auth-service) which
 *      attaches the JWT Authorization header and handles token refresh.
 *   2. Laravel API responses are mapped to our canonical `Review` type.
 *   3. Error handling uses typed `ReviewsError` for the UI.
 *
 * Expected Laravel endpoints (Sanctum-protected):
 *   GET    /admin/reviews              → paginated list (with ?search=&product_id=&rating=&visibility=&date_from=&date_to=)
 *   GET    /admin/reviews/:id          → single review detail
 *   PATCH  /admin/reviews/:id/status   { visibility } → update visibility
 *   DELETE /admin/reviews/:id          → soft-delete review
 *   GET    /admin/reviews/stats        → { averageRating, totalReviews, ratingDistribution }
 */

import { type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";
import type {
  Review,
  ReviewStats,
  ReviewVisibility,
  ReviewsListResponse,
  ReviewFilters,
} from "@/types/review";

// ─── Error class ──────────────────────────────────────────────────────

// FieldErrors is imported from lib/api-config
export type { FieldErrors };

export class ReviewsError extends AppError {
  declare code: "NOT_FOUND" | "VALIDATION_ERROR" | "FORBIDDEN" | "TOKEN_EXPIRED" | "NETWORK_ERROR" | "UNKNOWN";

  constructor(
    message: string,
    code: ReviewsError["code"],
    fields: FieldErrors = {}
  ) {
    super(message, code, fields);
    this.name = "ReviewsError";
  }
}

// ─── Laravel API response shapes ──────────────────────────────────────

/**
 * The ACTUAL shape returned by the backend's Admin\ReviewResource.
 * The backend nests user info in a user object and product info in a product object,
 * NOT flat customer_name/customer_email/product_name fields.
 */
interface LaravelReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string;
  visibility: ReviewVisibility;
  // Backend returns full UserResource for user
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar?: string | null;
  } | null;
  // Backend returns full ProductResource for product
  product?: {
    id: string;
    name?: string;
    name_en?: string;
    name_ar?: string;
    image?: string | null;
    slug?: string;
    price?: number;
  } | null;
  created_at: string;
  updated_at: string;
}

interface LaravelReviewsListResponse {
  data: LaravelReview[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface LaravelReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
}

/** Backend respondWithStats() wraps in { data: {...} } */
interface LaravelReviewStatsResponse {
  data: LaravelReviewStats;
}

// ─── Map Laravel review → Review ──────────────────────────────────────

export function mapLaravelReview(raw: LaravelReview): Review {
  // Build customer name from the backend's user object
  const user = raw.user;
  const customerName = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    : 'Unknown Customer';

  // Build product info from the backend's product object
  const product = raw.product;

  return {
    id: raw.id,
    customerName,
    customerEmail: user?.email ?? '',
    product: {
      productId: product?.id ?? raw.product_id,
      productName: product?.name ?? product?.name_en ?? '',
      productImage: product?.image ?? '',
      productSlug: product?.slug ?? '',
    },
    rating: raw.rating,
    title: raw.title ?? undefined,
    comment: raw.comment,
    visibility: raw.visibility,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ─── Auth-aware fetch wrapper ─────────────────────────────────────────

const reviewsFetch = createServiceFetch(ReviewsError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

// ─── Public API ───────────────────────────────────────────────────────

export async function fetchReviews(filters?: ReviewFilters & { page?: number; perPage?: number }): Promise<ReviewsListResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.productId) params.set("product_id", filters.productId);
    if (filters?.rating) params.set("rating", String(filters.rating));
    if (filters?.visibility) params.set("visibility", filters.visibility);
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters?.dateTo) params.set("date_to", filters.dateTo);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.perPage) params.set("per_page", String(filters.perPage));

    const qs = params.toString();
    const path = `/admin/reviews${qs ? `?${qs}` : ""}`;

    const data = await reviewsFetch<LaravelReviewsListResponse>(path);
    return {
      reviews: data.data.map(mapLaravelReview),
      total: data.meta.total,
      currentPage: data.meta.current_page,
      lastPage: data.meta.last_page,
    };
  } catch (err) {
    if (err instanceof ReviewsError && err.code === "FORBIDDEN") throw err;
    if (err instanceof ReviewsError) throw err;
    throw new ReviewsError(
      err instanceof Error ? err.message : "Failed to fetch reviews",
      "NETWORK_ERROR"
    );
  }
}

export async function updateReviewVisibility(
  id: string,
  visibility: ReviewVisibility
): Promise<Review> {
  try {
    const data = await reviewsFetch<{ data: LaravelReview }>(
      `/admin/reviews/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ visibility }),
      }
    );
    return mapLaravelReview(data.data);
  } catch (err) {
    if (err instanceof ReviewsError) throw err;
    throw new ReviewsError(
      err instanceof Error ? err.message : "Failed to update review visibility",
      "NETWORK_ERROR"
    );
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  try {
    await reviewsFetch<{ message: string }>(`/admin/reviews/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch (err) {
    if (err instanceof ReviewsError) throw err;
    throw new ReviewsError(
      err instanceof Error ? err.message : "Failed to delete review",
      "NETWORK_ERROR"
    );
  }
}

export async function fetchReviewStats(): Promise<ReviewStats> {
  try {
    const response = await reviewsFetch<LaravelReviewStatsResponse>("/admin/reviews/stats");
    // Backend respondWithStats() wraps in { data: {...} }
    const data = response.data;
    return {
      averageRating: data.average_rating ?? 0,
      totalReviews: data.total_reviews ?? 0,
      ratingDistribution: data.rating_distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  } catch (err) {
    if (err instanceof ReviewsError) throw err;
    throw new ReviewsError(
      err instanceof Error ? err.message : "Failed to fetch review stats",
      "NETWORK_ERROR"
    );
  }
}
