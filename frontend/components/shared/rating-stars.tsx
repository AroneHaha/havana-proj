import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingStars({ rating, size = "sm", className }: RatingStarsProps) {
  const stars = [];
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <Star key={i} className={cn(sizeClasses[size], "fill-gold text-gold")} />
      );
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push(
        <StarHalf key={i} className={cn(sizeClasses[size], "fill-gold text-gold")} />
      );
    } else {
      stars.push(
        <Star key={i} className={cn(sizeClasses[size], "text-muted-foreground/30")} />
      );
    }
  }

  return <div className={cn("flex items-center gap-0.5", className)}>{stars}</div>;
}
