"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { cn, formatPrice } from "@/lib/utils";
import { BadgeSale } from "./badge-sale";
import { RatingStars } from "./rating-stars";
import { Badge } from "@/components/ui/badge";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

export function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);

  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn("group relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700",
            isHovered && "scale-110"
          )}
          loading="lazy"
        />
        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Sale Badge */}
        {hasDiscount && <BadgeSale price={product.price} salePrice={product.salePrice!} />}
        {/* New Badge */}
        {product.isNew && !hasDiscount && (
          <Badge variant="new" className="absolute top-3 left-3 z-10">
            {t.productCard.new}
          </Badge>
        )}
        {/* Best Seller Badge */}
        {product.isBestSeller && !hasDiscount && !product.isNew && (
          <Badge variant="gold" className="absolute top-3 left-3 z-10">
            {t.productCard.bestSeller}
          </Badge>
        )}

        {/* REMOVED: Wishlist Heart button */}
        {/* REMOVED: Quick Add to Cart button */}

      </div>
      {/* Info */}
      <div className="mt-3 space-y-1.5">
        <h3 className="font-medium text-sm line-clamp-1 text-foreground group-hover:text-maroon dark:group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="font-bold text-maroon dark:text-gold">
                {formatPrice(product.salePrice!)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="font-bold text-foreground">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}