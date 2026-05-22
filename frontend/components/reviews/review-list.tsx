/** /frontend/components/reviews/review-list.tsx */

"use client";

import type { Review } from "@/types/review";
import { ReviewCard } from "./review-card";
import { MessageSquareOff } from "lucide-react";

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  onVisibilityChange?: (id: string, visibility: Review["visibility"]) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export function ReviewList({
  reviews,
  loading,
  onVisibilityChange,
  onDelete,
  emptyMessage = "No reviews found",
}: ReviewListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-maroon/30 border-t-maroon rounded-full animate-spin dark:border-gold/30 dark:border-t-gold" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MessageSquareOff className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
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