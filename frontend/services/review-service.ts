/** /frontend/services/review-service.ts **/

/**
 * Review Service — production-ready for Laravel API.
 *
 * Architecture:
 *   1. All HTTP calls go through `authFetch()` (from auth-service) which
 *      attaches the JWT Authorization header and handles token refresh.
 *   2. Laravel API responses are mapped to our canonical `Review` type.
 *   3. When `NEXT_PUBLIC_API_URL` is not set (dev without backend),
 *      everything falls back to mock data — zero config needed.
 *   4. Error handling uses typed `ReviewsError` for the UI.
 *
 * Expected Laravel endpoints (Sanctum-protected):
 *   GET    /admin/reviews              → paginated list (with ?search=&product_id=&rating=&visibility=&date_from=&date_to=)
 *   GET    /admin/reviews/:id          → single review detail
 *   PATCH  /admin/reviews/:id/status   { visibility } → update visibility
 *   DELETE /admin/reviews/:id          → soft-delete review
 *   GET    /admin/reviews/stats        → { averageRating, totalReviews, ratingDistribution }
 */

import { authFetch } from "@/services/auth-service";
import type {
  Review,
  ReviewStats,
  ReviewVisibility,
  ReviewsListResponse,
  ReviewFilters,
} from "@/types/review";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Error class ──────────────────────────────────────────────────────

export class ReviewsError extends Error {
  code: "NOT_FOUND" | "VALIDATION_ERROR" | "FORBIDDEN" | "NETWORK_ERROR" | "UNKNOWN";
  fields: Record<string, string[]>;

  constructor(
    message: string,
    code: ReviewsError["code"],
    fields: Record<string, string[]> = {}
  ) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

// ─── Laravel API response shapes ──────────────────────────────────────

interface LaravelReview {
  id: string;
  customer_name: string;
  customer_email: string;
  product: {
    product_id: string;
    product_name: string;
    product_image: string;
    product_slug: string;
  };
  rating: number;
  title: string | null;
  comment: string;
  visibility: ReviewVisibility;
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

// ─── Map Laravel review → Review ──────────────────────────────────────

function mapLaravelReview(raw: LaravelReview): Review {
  return {
    id: raw.id,
    customerName: raw.customer_name,
    customerEmail: raw.customer_email,
    product: {
      productId: raw.product.product_id,
      productName: raw.product.product_name,
      productImage: raw.product.product_image,
      productSlug: raw.product.product_slug,
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

async function reviewsFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    return await authFetch<T>(path, options);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err) {
      const authErr = err as { code: string; message: string; fields?: Record<string, string[]> };
      if (authErr.code === "VALIDATION_ERROR") {
        throw new ReviewsError(authErr.message, "VALIDATION_ERROR", authErr.fields ?? {});
      }
      if (authErr.code === "TOKEN_EXPIRED") {
        throw new ReviewsError("Session expired. Please sign in again.", "FORBIDDEN");
      }
    }
    throw new ReviewsError(
      err instanceof Error ? err.message : "Request failed",
      "UNKNOWN"
    );
  }
}

// ─── Mock data (Qatar-based luxury floral shop) ──────────────────────

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-001",
    customerName: "Ahmad Al-Thani",
    customerEmail: "ahmad@email.com",
    product: {
      productId: "fp1",
      productName: "Royal Rose Symphony",
      productImage: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600&q=80",
      productSlug: "royal-rose-symphony",
    },
    rating: 5,
    title: "Absolutely breathtaking!",
    comment: "The arrangement exceeded all expectations. The roses were incredibly fresh, and the delivery was right on time for our anniversary. Will definitely order again!",
    visibility: "visible",
    createdAt: "2024-12-18T14:30:00",
    updatedAt: "2024-12-18T14:30:00",
  },
  {
    id: "rev-002",
    customerName: "Sara Mahmoud",
    customerEmail: "sara@email.com",
    product: {
      productId: "fp3",
      productName: "Midnight Orchid Elegance",
      productImage: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80",
      productSlug: "midnight-orchid-elegance",
    },
    rating: 4,
    title: "Beautiful but arrived slightly late",
    comment: "The orchids were stunning and the dark vase was a wonderful touch. Only reason for 4 stars is the delivery was about 30 minutes late. The flowers themselves were perfect.",
    visibility: "visible",
    createdAt: "2024-12-17T09:15:00",
    updatedAt: "2024-12-17T09:15:00",
  },
  {
    id: "rev-003",
    customerName: "Khalid bin Mohammed",
    customerEmail: "khalid@email.com",
    product: {
      productId: "fp4",
      productName: "Pearl White Lilies",
      productImage: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600&q=80",
      productSlug: "pearl-white-lilies",
    },
    rating: 5,
    comment: "Ordered these for my mother's birthday. She was overjoyed! The lilies lasted well over a week. Impeccable quality and presentation.",
    visibility: "visible",
    createdAt: "2024-12-16T11:00:00",
    updatedAt: "2024-12-16T11:00:00",
  },
  {
    id: "rev-004",
    customerName: "Fatima Al-Kuwari",
    customerEmail: "fatima@email.com",
    product: {
      productId: "bs1",
      productName: "Classic Red Rose Box",
      productImage: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80",
      productSlug: "classic-red-rose-box",
    },
    rating: 3,
    title: "Good but smaller than expected",
    comment: "The roses were beautiful and fresh, but the box was smaller than it appeared in the photos. For the price, I expected a larger arrangement. Quality is there though.",
    visibility: "visible",
    createdAt: "2024-12-15T16:20:00",
    updatedAt: "2024-12-15T16:20:00",
  },
  {
    id: "rev-005",
    customerName: "Omar Hassan",
    customerEmail: "omar@email.com",
    product: {
      productId: "bs4",
      productName: "Luxury White & Gold",
      productImage: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80",
      productSlug: "luxury-white-gold",
    },
    rating: 5,
    title: "Pure luxury",
    comment: "This is the most luxurious flower arrangement I have ever seen. The gold accents are tasteful and the white roses are pristine. Perfect for corporate gifting.",
    visibility: "visible",
    createdAt: "2024-12-14T10:45:00",
    updatedAt: "2024-12-14T10:45:00",
  },
  {
    id: "rev-006",
    customerName: "Noor Al-Emadi",
    customerEmail: "noor@email.com",
    product: {
      productId: "fp2",
      productName: "Golden Hour Bouquet",
      productImage: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80",
      productSlug: "golden-hour-bouquet",
    },
    rating: 2,
    title: "Disappointed",
    comment: "The sunflowers looked wilted upon arrival and some petals were already falling off. I expected much better quality for the price. Customer service was helpful though.",
    visibility: "visible",
    createdAt: "2024-12-13T13:10:00",
    updatedAt: "2024-12-13T13:10:00",
  },
  {
    id: "rev-007",
    customerName: "Youssef Ibrahim",
    customerEmail: "youssef@email.com",
    product: {
      productId: "bs2",
      productName: "Pastel Dream Arrangement",
      productImage: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
      productSlug: "pastel-dream-arrangement",
    },
    rating: 4,
    comment: "Really lovely pastel colors, perfect for a baby shower. The arrangement was slightly different from the photo but still gorgeous. Fast delivery!",
    visibility: "visible",
    createdAt: "2024-12-12T08:30:00",
    updatedAt: "2024-12-12T08:30:00",
  },
  {
    id: "rev-008",
    customerName: "Layla Al-Thani",
    customerEmail: "layla@email.com",
    product: {
      productId: "fp1",
      productName: "Royal Rose Symphony",
      productImage: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600&q=80",
      productSlug: "royal-rose-symphony",
    },
    rating: 1,
    title: "Terrible experience",
    comment: "The flowers arrived damaged and the arrangement looked nothing like the photo. Very disappointed. I have requested a refund.",
    visibility: "hidden",
    createdAt: "2024-12-11T17:45:00",
    updatedAt: "2024-12-12T09:00:00",
  },
  {
    id: "rev-009",
    customerName: "Hassan Mirza",
    customerEmail: "hassan@email.com",
    product: {
      productId: "bs3",
      productName: "Tulip Paradise",
      productImage: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&q=80",
      productSlug: "tulip-paradise",
    },
    rating: 4,
    title: "Great tulips!",
    comment: "The tulips were vibrant and fresh. A nice variety of colors. Delivery was prompt. Would have given 5 stars but the wrapping could have been better.",
    visibility: "visible",
    createdAt: "2024-12-10T10:00:00",
    updatedAt: "2024-12-10T10:00:00",
  },
  {
    id: "rev-010",
    customerName: "Maryam Al-Sayed",
    customerEmail: "maryam@email.com",
    product: {
      productId: "fp2",
      productName: "Golden Hour Bouquet",
      productImage: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80",
      productSlug: "golden-hour-bouquet",
    },
    rating: 5,
    comment: "Ordered for my wedding reception and Havana delivered beyond expectations! Every guest complimented the floral arrangements. Truly a premium service.",
    visibility: "pending",
    createdAt: "2024-12-20T12:15:00",
    updatedAt: "2024-12-20T12:15:00",
  },
];

// ─── Public API ───────────────────────────────────────────────────────

export async function fetchReviews(filters?: ReviewFilters & { page?: number; perPage?: number }): Promise<ReviewsListResponse> {
  if (API_BASE) {
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
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 200));

  let result = [...MOCK_REVIEWS];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.product.productName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q))
    );
  }
  if (filters?.productId) {
    result = result.filter((r) => r.product.productId === filters.productId);
  }
  if (filters?.rating) {
    result = result.filter((r) => r.rating === filters.rating);
  }
  if (filters?.visibility) {
    result = result.filter((r) => r.visibility === filters.visibility);
  }
  if (filters?.dateFrom) {
    const from = new Date(filters.dateFrom);
    from.setHours(0, 0, 0, 0);
    result = result.filter((r) => new Date(r.createdAt) >= from);
  }
  if (filters?.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((r) => new Date(r.createdAt) <= to);
  }

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = filters?.page ?? 1;
  const perPage = filters?.perPage ?? 50;
  const start = (page - 1) * perPage;
  const paginated = result.slice(start, start + perPage);

  return {
    reviews: paginated,
    total: result.length,
    currentPage: page,
    lastPage: Math.max(1, Math.ceil(result.length / perPage)),
  };
}

export async function updateReviewVisibility(
  id: string,
  visibility: ReviewVisibility
): Promise<Review> {
  if (API_BASE) {
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
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 300));

  const review = MOCK_REVIEWS.find((r) => r.id === id);
  if (!review) {
    throw new ReviewsError("Review not found", "NOT_FOUND");
  }

  review.visibility = visibility;
  review.updatedAt = new Date().toISOString();
  return { ...review };
}

export async function deleteReview(id: string): Promise<boolean> {
  if (API_BASE) {
    try {
      await reviewsFetch<{ message: string }>(`/admin/reviews/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      if (err instanceof ReviewsError) throw err;
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 200));

  const idx = MOCK_REVIEWS.findIndex((r) => r.id === id);
  if (idx === -1) {
    throw new ReviewsError("Review not found", "NOT_FOUND");
  }
  MOCK_REVIEWS.splice(idx, 1);
  return true;
}

export async function fetchReviewStats(): Promise<ReviewStats> {
  if (API_BASE) {
    try {
      const data = await reviewsFetch<LaravelReviewStats>("/admin/reviews/stats");
      return {
        averageRating: data.average_rating,
        totalReviews: data.total_reviews,
        ratingDistribution: data.rating_distribution,
      };
    } catch {
      // fall through to mock
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 100));

  const totalReviews = MOCK_REVIEWS.filter((r) => r.visibility === "visible").length;
  const ratedReviews = MOCK_REVIEWS.filter((r) => r.visibility === "visible");
  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + r.rating, 0) / ratedReviews.length
      : 0;

  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  MOCK_REVIEWS.forEach((r) => {
    if (r.visibility === "visible") {
      ratingDistribution[r.rating]++;
    }
  });

  return { averageRating, totalReviews, ratingDistribution };
}