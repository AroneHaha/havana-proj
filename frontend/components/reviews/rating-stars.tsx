/** /frontend/components/reviews/rating-stars.tsx */

"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  className,
}: RatingStarsProps) {
  const stars = [];
  const clampedRating = Math.min(Math.max(0, rating), maxRating);

  for (let i = 1; i <= maxRating; i++) {
    const filled = i <= Math.floor(clampedRating);
    const halfFilled = !filled && i === Math.ceil(clampedRating) && clampedRating % 1 >= 0.25;

    stars.push(
      <Star
        key={i}
        className={cn(
          sizeMap[size],
          filled || halfFilled
            ? "fill-amber-400 text-amber-400"
            : "fill-transparent text-muted-foreground/30"
        )}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <div className="flex items-center">{stars}</div>
      {showValue && (
        <span className={cn("ms-1.5 font-medium text-foreground", textSizeMap[size])}>
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}