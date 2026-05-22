import { cn } from "@/lib/utils";
import { calculateDiscount } from "@/lib/calculate-discount";

interface BadgeSaleProps {
  price: number;
  salePrice: number;
  className?: string;
}

export function BadgeSale({ price, salePrice, className }: BadgeSaleProps) {
  const discount = calculateDiscount(price, salePrice);
  return (
    <span
      className={cn(
        "absolute top-3 left-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-md",
        className
      )}
    >
      -{discount}%
    </span>
  );
}
