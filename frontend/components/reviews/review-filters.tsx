/** /frontend/components/reviews/review-filters.tsx */

"use client";

import type { ReviewFilters, ReviewVisibility } from "@/types/review";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import { getUniqueProducts } from "@/lib/review-helpers";
import type { Review } from "@/types/review";

interface ReviewFiltersProps {
  filters: ReviewFilters;
  reviews: Review[];
  onFilterChange: (filters: Partial<ReviewFilters>) => void;
  onReset: () => void;
}

const ratingOptions = [5, 4, 3, 2, 1];
const visibilityOptions: { value: ReviewVisibility; label: string }[] = [
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
  { value: "pending", label: "Pending" },
];

export function ReviewFiltersBar({
  filters,
  reviews,
  onFilterChange,
  onReset,
}: ReviewFiltersProps) {
  const products = getUniqueProducts(reviews);
  const hasActiveFilters =
    filters.productId || filters.rating || filters.visibility || filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Product filter */}
      <select
        value={filters.productId ?? ""}
        onChange={(e) => onFilterChange({ productId: e.target.value || undefined })}
        className="h-9 rounded-xl border border-border bg-white dark:bg-dark-card px-3 text-sm text-foreground focus:ring-2 focus:ring-maroon dark:focus:ring-gold cursor-pointer"
      >
        <option value="">All Products</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Rating filter */}
      <select
        value={filters.rating ?? ""}
        onChange={(e) => onFilterChange({ rating: e.target.value ? Number(e.target.value) : undefined })}
        className="h-9 rounded-xl border border-border bg-white dark:bg-dark-card px-3 text-sm text-foreground focus:ring-2 focus:ring-maroon dark:focus:ring-gold cursor-pointer"
      >
        <option value="">All Ratings</option>
        {ratingOptions.map((r) => (
          <option key={r} value={r}>
            {r} Star{r !== 1 ? "s" : ""}
          </option>
        ))}
      </select>

      {/* Visibility filter */}
      <select
        value={filters.visibility ?? ""}
        onChange={(e) => onFilterChange({ visibility: (e.target.value as ReviewVisibility) || undefined })}
        className="h-9 rounded-xl border border-border bg-white dark:bg-dark-card px-3 text-sm text-foreground focus:ring-2 focus:ring-maroon dark:focus:ring-gold cursor-pointer"
      >
        <option value="">All Statuses</option>
        {visibilityOptions.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </select>

      {/* Date from */}
      <input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(e) => onFilterChange({ dateFrom: e.target.value || undefined })}
        placeholder="From"
        className="h-9 rounded-xl border border-border bg-white dark:bg-dark-card px-3 text-sm text-foreground focus:ring-2 focus:ring-maroon dark:focus:ring-gold"
      />

      {/* Date to */}
      <input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(e) => onFilterChange({ dateTo: e.target.value || undefined })}
        placeholder="To"
        className="h-9 rounded-xl border border-border bg-white dark:bg-dark-card px-3 text-sm text-foreground focus:ring-2 focus:ring-maroon dark:focus:ring-gold"
      />

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}