/** /frontend/components/reviews/rating-summary.tsx */
"use client";

import { RatingStars } from "./rating-stars";
import type { ReviewStats } from "@/types/review";
import { getRatingPercentage } from "@/lib/review-helpers";

interface RatingSummaryProps {
  stats: ReviewStats | null;
}

export function RatingSummary({ stats }: RatingSummaryProps) {
  const average = stats?.averageRating ?? 0;
  const total = stats?.totalReviews ?? 0;
  const distribution = stats?.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-dark-card p-6">
      {/* Average + total */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{average.toFixed(1)}</p>
          <RatingStars rating={average} size="md" />
          <p className="text-xs text-muted-foreground mt-1">{total} reviews</p>
        </div>
      </div>

      {/* Distribution bars */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] ?? 0;
          const pct = getRatingPercentage(count, total);
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-right text-muted-foreground">{star}</span>
              <StarIcon className="h-3 w-3 text-amber-400 fill-amber-400" />
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}