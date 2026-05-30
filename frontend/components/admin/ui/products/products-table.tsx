"use client";

import { motion } from "framer-motion";
import { Edit3, Trash2, Flower2 } from "lucide-react";
import type { AdminProduct } from "./products-types";
import { PRODUCT_STATUS_CONFIG } from "@/lib/constant";
import { formatPrice } from "@/lib/utils";

interface ProductGridProps {
  products: AdminProduct[];
  onOpenEdit: (product: AdminProduct) => void;
  onPreview: (product: AdminProduct) => void;
  onDelete: (id: string) => void;
}

export function ProductGrid({
  products,
  onOpenEdit,
  onPreview,
  onDelete,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-border ring-1 ring-black/[0.03] dark:ring-white/[0.03] shadow-elevated p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
          <Flower2 className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="bg-white dark:bg-dark-card rounded-xl border border-border ring-1 ring-black/[0.03] dark:ring-white/[0.03] shadow-elevated-hover overflow-hidden group cursor-pointer"
          onClick={() => onPreview(product)}
        >
          {/* ── Image ── */}
          <div className="relative aspect-square bg-muted/30 overflow-hidden">
            {product.soldOut && (
              <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-xs tracking-wide uppercase">Sold Out</span>
              </div>
            )}
            {product.images[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-inset">
                <Flower2 className="w-10 h-10 text-maroon/20 dark:text-gold/20" />
              </div>
            )}

            {/* Hover actions — both on right side */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="absolute bottom-2 right-2 flex items-end gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenEdit(product); }}
                  className="p-2 rounded-lg bg-white/90 dark:bg-dark-card/90 hover:bg-white dark:hover:bg-dark-card transition-colors cursor-pointer shadow-sm ring-1 ring-black/5"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                  className="p-2 rounded-lg bg-red-500/90 hover:bg-red-500 transition-colors cursor-pointer shadow-sm ring-1 ring-red-400/20"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Status badge */}
            <div className="absolute top-2 left-2 z-20">
              <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full shadow-xs ${PRODUCT_STATUS_CONFIG[product.status].color}`}>
                <span className={`w-1 h-1 rounded-full ${PRODUCT_STATUS_CONFIG[product.status].dot}`} />
                {PRODUCT_STATUS_CONFIG[product.status].label}
              </span>
            </div>

            {/* Image count */}
            {product.images.length > 1 && (
              <div className="absolute top-2 right-2 z-20 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                {product.images.length} photos
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="p-3 space-y-1.5">
            <div>
              <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-1">{product.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{product.nameAr}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {product.salePrice ? (
                  <>
                    <span className="text-sm font-bold text-maroon dark:text-gold">{formatPrice(product.salePrice)}</span>
                    <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-maroon dark:text-gold">{formatPrice(product.price)}</span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`}>
                {product.stock} in stock
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}