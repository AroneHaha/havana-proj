/** /frontend/components/reviews/review-card.tsx */
"use client";

import type { Review } from "@/types/review";
import { RatingStars } from "./rating-stars";
import { Badge } from "@/components/ui/badge";
import {
  formatReviewDate,
  getVisibilityBadgeClasses,
  getVisibilityLabel,
} from "@/lib/review-helpers";
import { Clock, Eye, EyeOff, Hourglass, Trash2 } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

interface ReviewCardProps {
  review: Review;
  onVisibilityChange?: (id: string, visibility: Review["visibility"]) => void;
  onDelete?: (id: string) => void;
}

const visibilityIcon = {
  visible: Eye,
  hidden: EyeOff,
  pending: Hourglass,
};

export function ReviewCard({ review, onVisibilityChange, onDelete }: ReviewCardProps) {
  const VisibilityIcon = visibilityIcon[review.visibility];
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale).admin.reviews;

  const nextVisibility = review.visibility === "visible" ? "hidden" : "visible";

  const visibilityLabels: Record<string, string> = {
    visible: t.visible,
    hidden: t.hidden,
    pending: t.pending,
  };

  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-dark-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* Product image */}
        <div className="hidden sm:block flex-shrink-0">
          <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted">
            <img
              src={review.product.productImage}
              alt={review.product.productName}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-foreground text-sm truncate">
                {review.customerName}
              </span>
              <Badge
                variant="secondary"
                className={getVisibilityBadgeClasses(review.visibility)}
              >
                <VisibilityIcon className="h-3 w-3 ms-1" />
                {getVisibilityLabel(review.visibility, visibilityLabels as any)}
              </Badge>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Clock className="h-3 w-3" />
              {formatReviewDate(review.createdAt, locale)}
            </span>
          </div>

          {/* Rating + product */}
          <div className="flex items-center gap-3 mb-2">
            <RatingStars rating={review.rating} size="sm" showValue />
            <span className="text-xs text-muted-foreground truncate">
              {review.product.productName}
            </span>
          </div>

          {/* Title */}
          {review.title && (
            <p className="text-sm font-medium text-foreground mb-1">{review.title}</p>
          )}

          {/* Comment */}
          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>

          {/* Actions */}
          {(onVisibilityChange || onDelete) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              {onVisibilityChange && (
                <button
                  onClick={() => onVisibilityChange(review.id, nextVisibility)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  {review.visibility === "visible" ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      {t.hide}
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      {t.show}
                    </>
                  )}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(review.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t.delete}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}