"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { BadgeSale } from "./badge-sale";
import { RatingStars } from "./rating-stars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, useWishlistStore } from "@/store";
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
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
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
        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110 cursor-pointer dark:bg-black/50 dark:hover:bg-black/70"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isInWishlist ? "fill-red-500 text-red-500" : "text-foreground"
            )}
          />
        </button>
        {/* Quick Add to Cart */}
        <div
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Button
            onClick={() => addItem(product)}
            size="sm"
            className="gap-2 bg-white text-foreground hover:bg-maroon hover:text-white shadow-xl dark:bg-dark-card dark:text-white dark:hover:bg-maroon"
          >
            <ShoppingBag className="h-4 w-4" />
            {t.productCard.addToCart}
          </Button>
        </div>
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
