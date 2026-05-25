/**
 * Review Types — canonical shape for the Reviews module.
 *
 * When the Laravel API is live, every field maps 1:1 to the
 * JSON response. While developing frontend-only, the service
 * layer provides seed objects that satisfy these same interfaces.
 */

/** /frontend/types/review.ts */
export type ReviewVisibility = "visible" | "hidden" | "pending";

export interface ReviewProductSnapshot {
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
}

export interface Review {
  id: string;
  /** Customer who wrote the review */
  customerName: string;
  customerEmail: string;
  /** Product this review is about (snapshot at review time) */
  product: ReviewProductSnapshot;
  /** Star rating 1–5 */
  rating: number;
  /** Review title (optional short summary) */
  title?: string;
  /** Full review message */
  comment: string;
  /** Visibility / moderation status */
  visibility: ReviewVisibility;
  /** ISO date when the review was submitted */
  createdAt: string;
  /** ISO date when the review was last updated */
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>; // { 1: count, 2: count, ... 5: count }
}

export interface ReviewsListResponse {
  reviews: Review[];
  total: number;
  currentPage: number;
  lastPage: number;
}

export interface ReviewFilters {
  search?: string;
  productId?: string;
  rating?: number;
  visibility?: ReviewVisibility;
  dateFrom?: string;
  dateTo?: string;
}