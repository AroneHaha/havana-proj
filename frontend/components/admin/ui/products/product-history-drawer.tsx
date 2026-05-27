"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  ShoppingBag,
  Star,
  MessageSquare,
  User,
  Edit3,
  Trash2,
} from "lucide-react";
import { useOrdersStore } from "@/store/orders-store";
import { useReviewsStore } from "@/store/review-store";
import { formatPrice } from "@/lib/utils";
import type { AdminProduct } from "./products-types";

interface ProductHistoryDrawerProps {
  product: AdminProduct | null;
  open: boolean;
  onClose: () => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (id: string) => void;
}

export function ProductHistoryDrawer({
  product,
  open,
  onClose,
  onEdit,
  onDelete,
}: ProductHistoryDrawerProps) {
  const orders = useOrdersStore((s) => s.orders);
  const reviews = useReviewsStore((s) => s.reviews);

  const itemsSold = useMemo(() => {
    if (!product) return 0;
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => {
        const match = o.items.find((item) => item.productId === product.id);
        return sum + (match ? match.quantity : 0);
      }, 0);
  }, [orders, product]);

  const totalRevenue = useMemo(() => {
    if (!product) return 0;
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => {
        const match = o.items.find((item) => item.productId === product.id);
        return sum + (match ? match.quantity * match.price : 0);
      }, 0);
  }, [orders, product]);

  const productReviews = useMemo(() => {
    if (!product) return [];
    return reviews.filter((r) => r.product.productId === product.id);
  }, [reviews, product]);

  const avgRating = useMemo(() => {
    if (productReviews.length === 0) return 0;
    return (
      productReviews.reduce((sum, r) => sum + r.rating, 0) /
      productReviews.length
    );
  }, [productReviews]);

  if (!product) return null;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-KW", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          }`}
        />
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-white dark:bg-dark-card shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-dark-card border-b border-border">
              <div className="flex items-center justify-between p-5">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Product Details</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{product.name}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Product Info */}
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-muted/30 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-maroon/20 dark:text-gold/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{product.name}</h3>
                    {/* Edit + Delete — only on small screens */}
                    <div className="flex items-center gap-1.5 sm:hidden shrink-0">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4 text-foreground" />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="p-1.5 rounded-lg bg-red-500/90 hover:bg-red-500 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.nameAr}</p>
                  <p className="text-xs text-muted-foreground mt-1">{product.sku} &middot; {product.category}</p>
                  <p className="text-lg font-bold text-maroon dark:text-gold mt-1">{formatPrice(product.salePrice ?? product.price)}</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1.5"><ShoppingBag className="w-4 h-4 text-emerald-500" /></div>
                  <p className="text-lg font-bold text-foreground">{itemsSold}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Items Sold</p>
                </div>
                <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1.5"><Star className="w-4 h-4 text-amber-500" /></div>
                  <p className="text-lg font-bold text-foreground">{avgRating.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Avg Rating</p>
                </div>
                <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1.5"><MessageSquare className="w-4 h-4 text-blue-500" /></div>
                  <p className="text-lg font-bold text-foreground">{productReviews.length}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Reviews</p>
                </div>
                <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1.5"><ShoppingBag className="w-4 h-4 text-maroon dark:text-gold" /></div>
                  <p className="text-lg font-bold text-foreground">{formatPrice(totalRevenue)}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Revenue</p>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-maroon dark:text-gold" />
                  Reviews
                  <span className="text-xs font-normal text-muted-foreground">({productReviews.length})</span>
                </h3>

                {productReviews.length === 0 ? (
                  <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No reviews found for this product</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {productReviews.map((review) => (
                      <div key={review.id} className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-maroon/10 dark:bg-gold/10 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-maroon dark:text-gold" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{review.customerName}</p>
                              <p className="text-[10px] text-muted-foreground">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        {review.title && (
                          <p className="text-xs font-semibold text-foreground">{review.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            review.visibility === "visible"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : review.visibility === "hidden"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {review.visibility === "visible" ? "Visible" : review.visibility === "hidden" ? "Hidden" : "Pending"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{review.customerEmail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}