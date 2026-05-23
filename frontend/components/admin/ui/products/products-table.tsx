"use client";

import { motion } from "framer-motion";
import { Edit3, Trash2, Eye, Flower2, Save, Package } from "lucide-react";
import type { AdminProduct } from "./products-page";
import { statusConfig } from "./products-page";

interface ProductGridProps {
  products: AdminProduct[];
  stockAdjust: { [id: string]: string };
  onStockAdjustChange: React.Dispatch<React.SetStateAction<{ [id: string]: string }>>;
  onStockAdjust: (id: string) => void;
  onToggleSoldOut: (id: string) => void;
  onOpenEdit: (product: AdminProduct) => void;
  onPreview: (product: AdminProduct) => void;
  onDelete: (id: string) => void;
  deleteConfirm: string | null;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ProductGrid({
  products,
  stockAdjust,
  onStockAdjustChange,
  onStockAdjust,
  onToggleSoldOut,
  onOpenEdit,
  onPreview,
  onDelete,
  deleteConfirm,
  setDeleteConfirm,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-border p-16 text-center">
        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden group"
        >
          {/* ── Image ── */}
          <div className="relative aspect-square bg-muted/30 overflow-hidden">
            {product.soldOut && (
              <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-lg tracking-wide uppercase">Sold Out</span>
              </div>
            )}
            {product.images[0] && product.images[0].startsWith("data:") ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Flower2 className="w-16 h-16 text-maroon/20 dark:text-gold/20" />
              </div>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onOpenEdit(product)}
                    className="p-2 rounded-lg bg-white/90 dark:bg-dark-card/90 hover:bg-white dark:hover:bg-dark-card transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4 text-foreground" />
                  </button>
                  <button
                    onClick={() => onPreview(product)}
                    className="p-2 rounded-lg bg-white/90 dark:bg-dark-card/90 hover:bg-white dark:hover:bg-dark-card transition-colors cursor-pointer"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4 text-foreground" />
                  </button>
                </div>
                {deleteConfirm === product.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => onDelete(product.id)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer">Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/90 dark:bg-dark-card/90 text-foreground hover:bg-white transition-colors cursor-pointer">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="p-2 rounded-lg bg-red-500/90 hover:bg-red-500 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Status badge */}
            <div className="absolute top-3 left-3 z-20">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full ${statusConfig[product.status].color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[product.status].dot}`} />
                {statusConfig[product.status].label}
              </span>
            </div>

            {/* Image count */}
            {product.images.length > 1 && (
              <div className="absolute top-3 right-3 z-20 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">
                {product.images.length} photos
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">{product.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{product.nameAr}</p>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-maroon dark:text-gold">QAR {product.price.toLocaleString()}</span>
              <span className={`text-xs font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`}>
                {product.stock} in stock
              </span>
            </div>

            {/* Stock adjust */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={stockAdjust[product.id] || ""}
                onChange={(e) => onStockAdjustChange((prev) => ({ ...prev, [product.id]: e.target.value }))}
                placeholder="+/- stock"
                className="flex-1 px-2.5 py-2 text-xs rounded-lg border border-border bg-white dark:bg-dark-bg text-foreground focus:outline-none focus:ring-1 focus:ring-maroon dark:focus:ring-gold"
              />
              <button
                onClick={() => onStockAdjust(product.id)}
                className="px-3 py-2 rounded-lg bg-maroon text-white dark:bg-gold dark:text-dark-bg text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onToggleSoldOut(product.id)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  product.soldOut
                    ? "border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    : "border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                }`}
              >
                {product.soldOut ? "Restock" : "Sold Out"}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}