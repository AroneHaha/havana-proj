"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Star, Tag } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import type { Product } from "@/types";
import { getStockStatus } from "@/store/product-store";

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  labels: {
    backToProducts: string;
    productDetails: string;
    productInfo: string;
    productName: string;
    sku: string;
    category: string;
    price: string;
    stock: string;
    status: string;
    rating: string;
    description: string;
    images: string;
  };
}

export function ProductDetailView({
  product,
  onBack,
  labels,
}: ProductDetailViewProps) {
  const stockStatus = getStockStatus(product);

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    in_stock: { label: "In Stock", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
    low_stock: { label: "Low Stock", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", dot: "bg-yellow-500" },
    sold_out: { label: "Sold Out", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" },
  };

  const st = statusConfig[stockStatus] ?? statusConfig.in_stock;

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-maroon dark:text-gold font-medium hover:underline mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        {labels.backToProducts}
      </button>

      <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-6">
        {labels.productDetails}
      </h1>

      {/* Product info card */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-border ring-1 ring-black/[0.03] dark:ring-white/[0.03] shadow-elevated p-6 mb-8">
        <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
          {labels.productInfo}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl bg-muted/30 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {(product.images && product.images.length > 0) && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg bg-muted/30 overflow-hidden">
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info grid */}
          <div className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{labels.productName}</p>
              <p className="text-lg font-semibold text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{product.slug}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{labels.sku}</p>
                <p className="text-sm font-mono font-medium text-foreground">{product.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{labels.category}</p>
                <p className="text-sm font-medium text-foreground capitalize">{product.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{labels.price}</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
                  {product.salePrice != null && product.salePrice < product.price && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md font-medium ring-1 ring-emerald-200/50 dark:ring-emerald-800/20">
                      {formatPrice(product.salePrice)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{labels.stock}</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shadow-xs ${st.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{labels.rating}</p>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium text-foreground">
                    {product.rating > 0 ? product.rating.toFixed(1) : "No ratings"}
                  </span>
                  {product.reviewCount > 0 && (
                    <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.isNew && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full ring-1 ring-emerald-200/50 dark:ring-emerald-800/20">
                      <Tag className="w-3 h-3" /> New
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full ring-1 ring-amber-200/50 dark:ring-amber-800/20">
                      <Tag className="w-3 h-3" /> Best Seller
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full ring-1 ring-blue-200/50 dark:ring-blue-800/20">
                      <Tag className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{labels.description}</p>
                <p className="text-sm text-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Locale text preview */}
            {product.localeText && Object.keys(product.localeText).length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Locale Text</p>
                <div className="space-y-2">
                  {Object.entries(product.localeText).map(([locale, text]) => (
                    <div key={locale} className="bg-muted/30 rounded-lg px-3 py-2 ring-1 ring-black/[0.02] dark:ring-white/[0.02]">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5">{locale}</p>
                      <p className="text-xs font-medium text-foreground">{text.name}</p>
                      {text.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{text.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}