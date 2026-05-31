"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
  Loader2,
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
  const fetchReviews = useReviewsStore((s) => s.fetchReviews);
  const reviewsLoading = useReviewsStore((s) => s.loading);

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

  // ─── Carousel state ──
  const allImages = product?.images ?? [];
  const [activeImg, setActiveImg] = useState(0);

  const goToImg = (dir: "prev" | "next") => {
    setActiveImg((prev) =>
      dir === "prev"
        ? (prev - 1 + allImages.length) % allImages.length
        : (prev + 1) % allImages.length
    );
  };

  // Reset carousel when product changes
  useEffect(() => { setActiveImg(0); }, [product?.id]);

  // ─── Reviews lazy load + pagination ──
  const REVIEW_PAGE_SIZE = 5;
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsFetchedFor, setReviewsFetchedFor] = useState<string | null>(null);

  // Lazy-fetch reviews for this product when drawer opens
  useEffect(() => {
    if (!open || !product?.id) return;
    if (reviewsFetchedFor !== product.id) {
      setReviewPage(1);
      fetchReviews({ productId: product.id, page: 1, perPage: 200 } as any);
      setReviewsFetchedFor(product.id);
    }
  }, [open, product?.id, reviewsFetchedFor, fetchReviews]);

  // Reset when drawer closes
  useEffect(() => {
    if (!open) setReviewsFetchedFor(null);
  }, [open]);

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

  const totalReviewPages = Math.max(1, Math.ceil(productReviews.length / REVIEW_PAGE_SIZE));

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

  // Is currently fetching for THIS product?
  const isFetching = reviewsLoading && productReviews.length === 0;

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
              {/* Image Carousel + Product Info */}
              <div className="space-y-3">
                {/* Main image */}
                {allImages.length > 0 ? (
                  <div className="relative aspect-[4/3] rounded-xl bg-muted/30 overflow-hidden group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImg}
                        src={allImages[activeImg]}
                        alt={`${product.name} ${activeImg + 1}`}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    </AnimatePresence>

                    {/* Nav arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => goToImg("prev")}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => goToImg("next")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Counter */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/40 text-white text-[10px] font-medium">
                        {activeImg + 1} / {allImages.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-xl bg-muted/30 flex items-center justify-center">
                    <Package className="w-12 h-12 text-maroon/20 dark:text-gold/20" />
                  </div>
                )}

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImg(idx)}
                        className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          idx === activeImg
                            ? "border-maroon dark:border-gold ring-1 ring-maroon/20 dark:ring-gold/20"
                            : "border-border opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Product text info */}
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
                <p className="text-xs text-muted-foreground">{product.nameAr}</p>
                <p className="text-xs text-muted-foreground">{product.sku} &middot; {product.category}</p>
                <p className="text-lg font-bold text-maroon dark:text-gold">{formatPrice(product.salePrice ?? product.price)}</p>
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

              {/* Product Details */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Stock</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      product.status === "in_stock"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : product.status === "low_stock"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        product.status === "in_stock" ? "bg-emerald-500" : product.status === "low_stock" ? "bg-yellow-500" : "bg-red-500"
                      }`} />
                      {product.status === "in_stock" ? "In Stock" : product.status === "low_stock" ? "Low Stock" : "Sold Out"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{product.stock} units</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Category</p>
                    <p className="text-xs font-medium text-foreground capitalize">{product.category}</p>
                  </div>
                </div>
                {product.description && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Description</p>
                    <p className="text-xs text-foreground leading-relaxed">{product.description}</p>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-maroon dark:text-gold" />
                  Reviews
                  <span className="text-xs font-normal text-muted-foreground">({productReviews.length})</span>
                  {reviewsLoading && (
                    <Loader2 className="w-3.5 h-3.5 text-maroon dark:text-gold animate-spin" />
                  )}
                </h3>

                {isFetching ? (
                  /* Loading skeleton while fetching */
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 space-y-2 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-muted/60 dark:bg-white/5" />
                            <div className="space-y-1">
                              <div className="h-3 w-20 rounded bg-muted/60 dark:bg-white/5" />
                              <div className="h-2 w-16 rounded bg-muted/60 dark:bg-white/5" />
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <div key={s} className="w-3.5 h-3.5 rounded bg-muted/60 dark:bg-white/5" />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1 pl-9">
                          <div className="h-2.5 w-full rounded bg-muted/60 dark:bg-white/5" />
                          <div className="h-2.5 w-3/4 rounded bg-muted/60 dark:bg-white/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : productReviews.length === 0 ? (
                  <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No reviews found for this product</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[620px] overflow-y-auto">
                      {productReviews
                        .slice((reviewPage - 1) * REVIEW_PAGE_SIZE, reviewPage * REVIEW_PAGE_SIZE)
                        .map((review) => (
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

                    {/* Pagination */}
                    {totalReviewPages > 1 && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                        <span className="text-[10px] text-muted-foreground">
                          {(reviewPage - 1) * REVIEW_PAGE_SIZE + 1}–{Math.min(reviewPage * REVIEW_PAGE_SIZE, productReviews.length)} of {productReviews.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                            disabled={reviewPage === 1}
                            className="p-1 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] text-muted-foreground font-medium tabular-nums">{reviewPage} / {totalReviewPages}</span>
                          <button
                            onClick={() => setReviewPage((p) => Math.min(totalReviewPages, p + 1))}
                            disabled={reviewPage === totalReviewPages}
                            className="p-1 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
