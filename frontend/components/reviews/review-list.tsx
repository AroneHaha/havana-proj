/** /frontend/components/reviews/review-list.tsx */
"use client";

import type { Review } from "@/types/review";
import { ReviewCard } from "./review-card";
import { MessageSquareOff } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  onVisibilityChange?: (id: string, visibility: Review["visibility"]) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-dark-card p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="hidden sm:block h-16 w-16 rounded-xl bg-muted flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3.5 w-3.5 rounded bg-muted" />
              ))}
            </div>
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
          <div className="h-3.5 w-48 rounded bg-muted" />
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted" />
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <div className="h-7 w-16 rounded-lg bg-muted" />
            <div className="h-7 w-16 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewList({
  reviews,
  loading,
  onVisibilityChange,
  onDelete,
  emptyMessage,
}: ReviewListProps) {
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale).admin.reviews;
  const resolvedEmptyMessage = emptyMessage ?? t.noReviewsFound;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MessageSquareOff className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground text-sm">{resolvedEmptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onVisibilityChange={onVisibilityChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
