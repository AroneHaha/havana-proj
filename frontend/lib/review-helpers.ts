/** /frontend/lib/review-helpers.ts **/

/**
 * Review helpers — utility functions for the Reviews module.
 */

import type { Review, ReviewVisibility } from "@/types/review";

/** Format a rating to one decimal place, e.g. 4.7 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** Format an ISO date string to a readable format */
export function formatReviewDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-QA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Get a human-readable label for a visibility status */
export function getVisibilityLabel(visibility: ReviewVisibility): string {
  const labels: Record<ReviewVisibility, string> = {
    visible: "Visible",
    hidden: "Hidden",
    pending: "Pending",
  };
  return labels[visibility] ?? visibility;
}

/** Get the Tailwind color classes for a visibility badge */
export function getVisibilityBadgeClasses(visibility: ReviewVisibility): string {
  const classes: Record<ReviewVisibility, string> = {
    visible: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    hidden: "bg-red-500/10 text-red-600 dark:text-red-400",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return classes[visibility] ?? "bg-muted text-muted-foreground";
}

/** Compute the percentage of reviews for a given rating out of total */
export function getRatingPercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

/** Truncate a comment to a max length with ellipsis */
export function truncateComment(comment: string, maxLength = 150): string {
  if (comment.length <= maxLength) return comment;
  return comment.slice(0, maxLength).trimEnd() + "...";
}

/** Get the star fill color class based on rating */
export function getStarColorClass(): string {
  return "text-amber-400";
}

/** Get the empty star color class */
export function getEmptyStarColorClass(): string {
  return "text-muted-foreground/30";
}

/** Count visible reviews from a list */
export function countVisibleReviews(reviews: Review[]): number {
  return reviews.filter((r) => r.visibility === "visible").length;
}

/** Unique products from a review list (for filter dropdown) */
export function getUniqueProducts(reviews: Review[]): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  reviews.forEach((r) => {
    if (!seen.has(r.product.productId)) {
      seen.set(r.product.productId, r.product.productName);
    }
  });
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}