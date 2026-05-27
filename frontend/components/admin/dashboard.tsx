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
  ArrowUpRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { useOrdersStore, STATUS_I18N_KEY } from "@/store/orders-store";
import { useProductsStore, getStockStatus } from "@/store/product-store";
import { useReviewsStore } from "@/store/review-store";
import { getDictionary } from "@/i18n";
import { formatPrice } from "@/lib/format-price";
import { ORDER_STATUS_COLORS } from "@/lib/constant";

export function AdminDashboard() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const t = dict.admin.dashboard;
  const tOrders = dict.admin.orders;
  const tProducts = dict.admin.products;
  const tReviews = dict.admin.reviews;
  const user = useAuthStore((s) => s.user);

  // ─── Store data ──
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

  const loading = ordersLoading || productsLoading || reviewsLoading;

  // ─── Fetch on mount ──
  useEffect(() => {
    fetchOrders();
    fetchStats();
    fetchProducts();
    fetchReviews();
    fetchReviewStats();
  }, [fetchOrders, fetchStats, fetchProducts, fetchReviews, fetchReviewStats]);

  // ─── Derived data ──
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

  // ─── Helpers ──
  const getStatusLabel = (status: string) => {
    const key = STATUS_I18N_KEY[status as keyof typeof STATUS_I18N_KEY];
    return key ? tOrders[key as keyof typeof tOrders] : status;
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "visible":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "hidden":
        return "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString(locale === "ar" ? "ar-KW" : "en-KW", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ─── Stats config ──
  const stats = [
    {
      labelKey: "totalRevenue",
      value: formatPrice(totalRevenue, locale),
      icon: DollarSign,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      labelKey: "totalOrders",
      value: String(orders.length),
      icon: ShoppingBag,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      labelKey: "activeUsers",
      value: "—",
      icon: Users,
      iconBg: "bg-violet-50 dark:bg-violet-900/20",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      labelKey: "products",
      value: String(products.length),
      icon: Flower2,
      iconBg: "bg-maroon/8 dark:bg-gold/15",
      iconColor: "text-maroon dark:text-gold",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl lg:text-[28px] font-bold text-foreground tracking-tight">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            {t.subtitle.replace("{name}", user?.firstName ?? "")}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{dateStr}</span>
        </div>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.labelKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
            className="group bg-white dark:bg-dark-card rounded-xl p-5 border border-border shadow-card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {t[stat.labelKey as keyof typeof t]}
              </span>
              <div className={`p-[7px] rounded-lg ${stat.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-20 bg-muted rounded-md animate-pulse" />
            ) : (
              <p className="text-[22px] font-semibold text-foreground tracking-tight leading-none">
                {stat.value}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* ─── Two-column grid: tables ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">

        {/* ─── Recent Orders Table ──────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">{t.recentOrders}</h2>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-maroon dark:hover:text-gold transition-colors"
            >
              {t.viewAll}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-5 space-y-2.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="p-8 text-sm text-muted-foreground text-center">{tOrders.noOrders}</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{t.order}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{t.customer}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider hidden sm:table-cell">{t.product}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{t.amount}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 last:border-0 table-row-hover">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">#{order.orderNumber || order.id}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{order.customer.name}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell truncate max-w-[140px]">
                        {order.items[0]?.productName}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{formatPrice(order.total, locale)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
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

        {/* ─── Low & Out of Stock ────────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">{tProducts.lowStockCount} & {tProducts.outOfStockCount}</h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-maroon dark:hover:text-gold transition-colors"
            >
              {t.viewAll}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-5 space-y-2.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : [...lowStockProducts, ...outOfStockProducts].length === 0 ? (
              <p className="p-8 text-sm text-muted-foreground text-center">{tProducts.noProducts}</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{tProducts.productName}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{tProducts.category}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{tProducts.price}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{tProducts.stock}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{tProducts.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...lowStockProducts, ...outOfStockProducts].slice(0, 5).map((product) => {
                    const status = getStockStatus(product);
                    const statusConfig = status === "low_stock"
                      ? { label: tProducts.lowStock, color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" }
                      : { label: tProducts.soldOut, color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
                    return (
                      <tr key={product.id} className="border-b border-border/50 last:border-0 table-row-hover">
                        <td className="px-5 py-3 text-sm font-medium text-foreground">{product.name}</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground capitalize">{product.category}</td>
                        <td className="px-5 py-3 text-sm font-medium text-foreground">{formatPrice(product.salePrice ?? product.price, locale)}</td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-semibold text-foreground">{product.stock}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${statusConfig.color}`}>
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

      {/* ─── Two-column grid: reviews + overview ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* ─── Recent Reviews ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-gold" />
              <h2 className="text-sm font-semibold text-foreground">{tReviews.recentReviews}</h2>
            </div>
            <Link
              href="/sales-reviews"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-maroon dark:hover:text-gold transition-colors"
            >
              {t.viewAll}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentReviews.length === 0 ? (
              <p className="p-8 text-sm text-muted-foreground text-center">{tReviews.noReviews}</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{tReviews.customer}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{tReviews.product}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{tReviews.rating}</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{tReviews.visibility}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReviews.map((review) => (
                    <tr key={review.id} className="border-b border-border/50 last:border-0 table-row-hover">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{review.customerName}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground truncate max-w-[120px]">{review.product.productName}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3 w-3 fill-gold text-gold" />
                          <span className="text-sm font-medium text-foreground">{review.rating}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium capitalize ${getVisibilityColor(review.visibility)}`}>
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

        {/* ─── Store Overview ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
            <Package className="h-3.5 w-3.5 text-blue-500" />
            <h2 className="text-sm font-semibold text-foreground">{t.storeOverview}</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {/* Average Order Value */}
            <div className="p-4 rounded-lg bg-surface-2 dark:bg-surface-1 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20">
                  <DollarSign className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{tOrders.averageOrder}</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{formatPrice(avgOrderValue, locale)}</p>
            </div>

            {/* Average Rating */}
            <div className="p-4 rounded-lg bg-surface-2 dark:bg-surface-1 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{t.averageRating}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-foreground">{averageRating.toFixed(1)}</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.round(averageRating) ? "fill-gold text-gold" : "text-border"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Active Orders */}
            <div className="p-4 rounded-lg bg-surface-2 dark:bg-surface-1 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-violet-50 dark:bg-violet-900/20">
                  <ShoppingBag className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{t.pendingOrders}</span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {t.activeCount.replace("{count}", String(activeOrders.length))}
              </p>
            </div>

            {/* Inventory Alerts */}
            <div className="p-4 rounded-lg bg-surface-2 dark:bg-surface-1 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{t.inventoryAlerts}</span>
              </div>
              <p className="text-[13px] font-medium text-foreground leading-snug">
                {t.inventorySummary
                  .replace("{lowCount}", String(lowStockProducts.length))
                  .replace("{outCount}", String(outOfStockProducts.length))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}