"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Star } from "lucide-react";
import { ReviewList } from "@/components/reviews";
import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/i18n";
import type { Order } from "@/store/orders-store";
import type { Review } from "@/store/review-store";

interface SalesDetailViewProps {
  order: Order;
  reviews: Review[];
  onBack: () => void;
  locale: Locale;
  formatDate: (dateStr: string) => string;
  labels: {
    backToSales: string;
    saleDetails: string;
    orderInfo: string;
    orderID: string;
    customer: string;
    date: string;
    total: string;
    products: string;
    reviewsFor: string;
    quantity: string;
    noReviewsForProduct: string;
    discount: string;
    deliveryAddress: string;
  };
}

export function SalesDetailView({
  order,
  reviews,
  onBack,
  locale,
  formatDate,
  labels,
}: SalesDetailViewProps) {
  // Group reviews by productId for this order's items
  const orderProductReviews = useMemo(() => {
    const grouped: Record<string, typeof reviews> = {};
    for (const item of order.items) {
      if (!grouped[item.productId]) {
        grouped[item.productId] = reviews.filter(
          (r) => r.product.productId === item.productId
        );
      }
    }
    return grouped;
  }, [order, reviews]);

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
        {labels.backToSales}
      </button>

      <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-6">
        {labels.saleDetails}
      </h1>

      {/* Order info card */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-border p-6 mb-8">
        <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
          {labels.orderInfo}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{labels.orderID}</p>
            <p className="text-sm font-semibold text-maroon dark:text-gold">#{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{labels.customer}</p>
            <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
            <p className="text-xs text-muted-foreground">{order.customer.email}</p>
            <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{labels.date}</p>
            <p className="text-sm text-foreground">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{labels.total}</p>
            <p className="text-sm font-bold text-foreground">{formatPrice(order.total, locale)}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">{labels.products}</h3>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{labels.quantity}: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatPrice(item.price * item.quantity, locale)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="space-y-6">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          {labels.reviewsFor} #{order.id}
        </h2>

        {order.items.map((item, idx) => {
          const productReviews = orderProductReviews[item.productId] ?? [];
          const avgRating =
            productReviews.length > 0
              ? productReviews.reduce((sum, r) => sum + r.rating, 0) /
                productReviews.length
              : 0;

          return (
            <div
              key={`${item.productId}-${idx}`}
              className="bg-white dark:bg-dark-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {item.productName}
                </h3>
                {productReviews.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-foreground">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({productReviews.length})
                    </span>
                  </div>
                )}
              </div>

              {productReviews.length > 0 ? (
                <ReviewList
                  reviews={productReviews}
                  loading={false}
                  onVisibilityChange={() => {}}
                  onDelete={() => {}}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-6">
                  <Star className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {labels.noReviewsForProduct}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}