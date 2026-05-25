"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Flower2,
  Users,
  Star,
  AlertTriangle,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { useOrdersStore, STATUS_I18N_KEY } from "@/store/orders-store";
import { useProductsStore, getStockStatus } from "@/store/product-store";
import { useReviewsStore } from "@/store/review-store";
import { getDictionary } from "@/i18n";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_COLORS } from "@/lib/constant";

export function AdminDashboard() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const t = dict.admin.dashboard;
  const tOrders = dict.admin.orders;
  const tProducts = dict.admin.products;
  const tReviews = dict.admin.reviews;
  const user = useAuthStore((s) => s.user);

  // ─── Store data — select RAW state, never call methods in selectors ──
  const ordersLoading = useOrdersStore((s) => s.loading);
  const orders = useOrdersStore((s) => s.orders);
  const orderStats = useOrdersStore((s) => s.stats);
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);
  const fetchStats = useOrdersStore((s) => s.fetchStats);

  const productsLoading = useProductsStore((s) => s.loading);
  const products = useProductsStore((s) => s.products);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);

  const reviewsLoading = useReviewsStore((s) => s.loading);
  const reviews = useReviewsStore((s) => s.reviews);
  const reviewStats = useReviewsStore((s) => s.stats);
  const fetchReviews = useReviewsStore((s) => s.fetchReviews);
  const fetchReviewStats = useReviewsStore((s) => s.fetchStats);

  const loading = ordersLoading || productsLoading;

  // ─── Fetch on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();
    fetchStats();
    fetchProducts();
    fetchReviews();
    fetchReviewStats();
  }, [fetchOrders, fetchStats, fetchProducts, fetchReviews, fetchReviewStats]);

  // ─── Derived data via useMemo (stable references, no infinite loops) ──
  const totalRevenue = useMemo(() => {
    if (orderStats) return orderStats.totalRevenue;
    return orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders, orderStats]);

  const avgOrderValue = useMemo(() => {
    if (orderStats) return orderStats.averageOrderValue;
    const delivered = orders.filter((o) => o.status === "delivered");
    if (delivered.length === 0) return 0;
    return delivered.reduce((sum, o) => sum + o.total, 0) / delivered.length;
  }, [orders, orderStats]);

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled"),
    [orders]
  );

  const recentOrders = useMemo(
    () => [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [orders]
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => getStockStatus(p) === "low_stock"),
    [products]
  );

  const outOfStockProducts = useMemo(
    () => products.filter((p) => getStockStatus(p) === "sold_out"),
    [products]
  );

  const averageRating = useMemo(() => {
    if (reviewStats) return reviewStats.averageRating;
    const visible = reviews.filter((r) => r.visibility === "visible");
    if (visible.length === 0) return 0;
    return visible.reduce((sum, r) => sum + r.rating, 0) / visible.length;
  }, [reviews, reviewStats]);

  const recentReviews = useMemo(
    () => [...reviews]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [reviews]
  );

  // ─── Status helpers ──────────────────────────────────────────────────
  const getStatusLabel = (status: string) => {
    const key = STATUS_I18N_KEY[status as keyof typeof STATUS_I18N_KEY];
    return key ? tOrders[key as keyof typeof tOrders] : status;
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "visible":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "hidden":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // ─── Stats config ────────────────────────────────────────────────────
  const stats = [
    { labelKey: "totalRevenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-emerald-500" },
    { labelKey: "totalOrders", value: String(orders.length), icon: ShoppingBag, color: "text-blue-500" },
    { labelKey: "activeUsers", value: "—", icon: Users, color: "text-purple-500" },
    { labelKey: "products", value: String(products.length), icon: Flower2, color: "text-gold" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle.replace("{name}", user?.firstName ?? "")}</p>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.labelKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{t[stat.labelKey as keyof typeof t]}</span>
              <div className={`p-2 rounded-xl bg-muted/50 ${stat.color}`}><stat.icon className="h-4 w-4" /></div>
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-muted rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* ─── Two-column grid: tables ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* ─── Recent Orders Table ──────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-serif text-lg font-semibold text-foreground">{t.recentOrders}</h2>
            <Link href="/orders" className="text-sm text-maroon dark:text-gold font-medium hover:underline">{t.viewAll}</Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">{tOrders.noOrders}</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.order}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.customer}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t.product}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.amount}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">#{order.id}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{order.customer.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">{order.items[0]?.productName}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ─── Low & Out of Stock Products Table ────────────────────── */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <h2 className="font-serif text-lg font-semibold text-foreground">{tProducts.lowStockCount} & {tProducts.outOfStockCount}</h2>
            </div>
            <Link href="/products" className="text-sm text-maroon dark:text-gold font-medium hover-underline">{t.viewAll}</Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : [...lowStockProducts, ...outOfStockProducts].length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">{tProducts.noProducts}</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{tProducts.productName}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{tProducts.category}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{tProducts.price}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{tProducts.stock}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{tProducts.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...lowStockProducts, ...outOfStockProducts].slice(0, 5).map((product) => {
                    const status = getStockStatus(product);
                    const statusConfig = status === "low_stock"
                      ? { label: tProducts.lowStock, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" }
                      : { label: tProducts.soldOut, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
                    return (
                      <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{product.category}</td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{formatPrice(product.salePrice ?? product.price)}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-foreground">{product.stock}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ─── Two-column grid: reviews + stats ────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ─── Recent Reviews Table ─────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-gold" />
              <h2 className="font-serif text-lg font-semibold text-foreground">{tReviews.recentReviews}</h2>
            </div>
            <Link href="/sales-reviews" className="text-sm text-maroon dark:text-gold font-medium hover-underline">{t.viewAll}</Link>
          </div>
          <div className="overflow-x-auto">
            {recentReviews.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">{tReviews.noReviews}</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{tReviews.customer}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{tReviews.product}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{tReviews.rating}</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{tReviews.visibility}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReviews.map((review) => (
                    <tr key={review.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{review.customerName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{review.product.productName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                          <span className="text-sm font-medium text-foreground">{review.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getVisibilityColor(review.visibility)}`}>
                          {review.visibility}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ─── Quick Stats Summary ──────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <h2 className="font-serif text-lg font-semibold text-foreground">{t.storeOverview}</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Average Order Value */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">{tOrders.averageOrder}</p>
                <p className="text-xl font-bold text-foreground">{formatPrice(avgOrderValue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
            </div>

            {/* Average Rating */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">{t.averageRating}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(averageRating) ? "fill-gold text-gold" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gold/10">
                <Star className="h-5 w-5 text-gold" />
              </div>
            </div>

            {/* Pending Orders */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">{t.pendingOrders}</p>
                <p className="text-xl font-bold text-foreground">{t.activeCount.replace("{count}", String(activeOrders.length))}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <ShoppingBag className="h-5 w-5 text-yellow-500" />
              </div>
            </div>

            {/* Inventory Summary */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">{t.inventoryAlerts}</p>
                <p className="text-xl font-bold text-foreground">
                  {t.inventorySummary
                    .replace("{lowCount}", String(lowStockProducts.length))
                    .replace("{outCount}", String(outOfStockProducts.length))}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}