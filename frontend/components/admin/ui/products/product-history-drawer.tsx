"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  ShoppingBag,
  Star,
  Clock,
  User,
  MessageSquare,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useOrdersStore, STATUS_I18N_KEY, type Order, type OrderStatus } from "@/store/orders-store";
import { useReviewsStore } from "@/store/review-store";
import { formatPrice } from "@/lib/format-price";
import type { AdminProduct } from "./products-page";
import { statusColors, statusDotColors } from "../orders/constants";

interface ProductHistoryDrawerProps {
  product: AdminProduct | null;
  open: boolean;
  onClose: () => void;
}

export function ProductHistoryDrawer({
  product,
  open,
  onClose,
}: ProductHistoryDrawerProps) {
  const orders = useOrdersStore((s) => s.orders);
  const reviews = useReviewsStore((s) => s.reviews);

  const productOrders = useMemo(() => {
    if (!product) return [];
    return orders
      .map((order) => {
        const matchingItems = order.items.filter(
          (item) => item.productId === product.id
        );
        if (matchingItems.length === 0) return null;
        return { ...order, matchingItems };
      })
      .filter(Boolean) as (Order & { matchingItems: Order["items"] })[];
  }, [orders, product]);

  const productReviews = useMemo(() => {
    if (!product) return [];
    return reviews.filter((r) => r.product.productId === product.id);
  }, [reviews, product]);

  const totalUnitsSold = useMemo(() => {
    return productOrders.reduce(
      (sum, order) =>
        sum +
        order.matchingItems.reduce((s, item) => s + item.quantity, 0),
      0
    );
  }, [productOrders]);

  const totalRevenue = useMemo(() => {
    return productOrders.reduce(
      (sum, order) =>
        sum +
        order.matchingItems.reduce(
          (s, item) => s + item.price * item.quantity,
          0
        ),
      0
    );
  }, [productOrders]);

  const avgRating = useMemo(() => {
    if (productReviews.length === 0) return 0;
    return (
      productReviews.reduce((sum, r) => sum + r.rating, 0) /
      productReviews.length
    );
  }, [productReviews]);

  if (!product) return null;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-QA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusLabel = (status: OrderStatus) => {
    const key = STATUS_I18N_KEY[status];
    const labels: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[key] || status;
  };

  const renderStars = (rating: number) => {
    return (
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
  };

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
                  {product.images[0] && product.images[0].startsWith("data:") ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-maroon/20 dark:text-gold/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.nameAr}</p>
                  <p className="text-xs text-muted-foreground mt-1">{product.sku} &middot; {product.category}</p>
                  <p className="text-lg font-bold text-maroon dark:text-gold mt-1">QAR {product.price.toLocaleString()}</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1.5"><ShoppingBag className="w-4 h-4 text-blue-500" /></div>
                  <p className="text-lg font-bold text-foreground">{totalUnitsSold}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Units Sold</p>
                </div>
                <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1.5"><CreditCard className="w-4 h-4 text-emerald-500" /></div>
                  <p className="text-lg font-bold text-foreground">{totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Revenue (QAR)</p>
                </div>
                <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center mb-1.5"><Star className="w-4 h-4 text-amber-500" /></div>
                  <p className="text-lg font-bold text-foreground">{avgRating.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Avg Rating</p>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-maroon dark:text-gold" />
                  Order History
                  <span className="text-xs font-normal text-muted-foreground">({productOrders.length} orders)</span>
                </h3>

                {productOrders.length === 0 ? (
                  <div className="bg-muted/50 dark:bg-[#111] rounded-xl p-6 text-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No orders found for this product</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {productOrders.map((order) => (
                      <div key={order.id} className="bg-muted/50 dark:bg-[#111] rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-maroon dark:text-gold">#{order.id}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                            <span className={`w-1 h-1 rounded-full ${statusDotColors[order.status]}`} />
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="w-3 h-3 shrink-0" />
                          <span>{order.customer.name}</span>
                          <span className="text-border">|</span>
                          <span>{order.customer.phone}</span>
                        </div>
                        <div className="space-y-1">
                          {order.matchingItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-foreground">{item.productName} x{item.quantity}</span>
                              <span className="font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(order.createdAt)}</div>
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span className="truncate max-w-[140px]">{order.customer.address}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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