"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Flower2,
  Star,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  BarChart3,
  Eye,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { useOrdersStore, STATUS_I18N_KEY } from "@/store/orders-store";
import { useProductsStore, getStockStatus } from "@/store/product-store";
import { useReviewsStore } from "@/store/review-store";
import { useDashboardData } from "@/lib/use-dashboard-data";
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
  const totalOrderCount = useOrdersStore((s) => s.totalOrders);
  const orderStats = useOrdersStore((s) => s.stats);

  const productsLoading = useProductsStore((s) => s.loading);
  const products = useProductsStore((s) => s.products);

  const reviewsLoading = useReviewsStore((s) => s.loading);
  const reviews = useReviewsStore((s) => s.reviews);
  const reviewStats = useReviewsStore((s) => s.stats);

  // ─── Single-request dashboard data ──
  const { loading: dashboardLoading, error: dashboardError } = useDashboardData();

  const loading = ordersLoading || productsLoading || reviewsLoading || dashboardLoading;

  // ─── Fetch list data on mount (stats are already hydrated by useDashboardData) ──
  useEffect(() => {
    useOrdersStore.getState().fetchOrders();
    useProductsStore.getState().fetchProducts();
    useReviewsStore.getState().fetchReviews();
  }, []);

const totalRevenue = useMemo(() => {
    if (orderStats) return orderStats.totalRevenue ?? 0;
    return orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (o.total ?? 0), 0);
  }, [orders, orderStats]);

const avgOrderValue = useMemo(() => {
    if (orderStats) return orderStats.averageOrderValue ?? 0;
    const delivered = orders.filter((o) => o.status === "delivered");
    if (delivered.length === 0) return 0;
    return delivered.reduce((sum, o) => sum + (o.total ?? 0), 0) / delivered.length;
  }, [orders, orderStats]);

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled"),
    [orders]
  );

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending"),
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
    if (reviewStats) return reviewStats.averageRating ?? 0;
    const visible = reviews.filter((r) => r.visibility === "visible");
    if (visible.length === 0) return 0;
    return visible.reduce((sum, r) => sum + (r.rating ?? 0), 0) / visible.length;
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

  const revenueRatio = orders.length > 0 ? (orders.filter(o => o.status === "delivered").length / orders.length) : 0;

  // Quick nav items for sidebar
  const quickNav = [
    { href: "/orders", label: tOrders.title, icon: ShoppingBag, count: orders.length, color: "text-blue-500" },
    { href: "/products", label: tProducts.title, icon: Flower2, count: products.length, color: "text-maroon dark:text-gold" },
    { href: "/sales-reviews", label: tReviews.title, icon: BarChart3, count: null, color: "text-emerald-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* ─── Header ─── */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
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
      </div>

      {/* ─── Main Layout: Sidebar Metrics + Dashboard Workspace ─── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-13rem)]">

        {/* ═══════ LEFT SIDEBAR — Key Metrics ═══════ */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:w-64 xl:w-72 shrink-0 lg:h-full"
        >
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-4 lg:h-full">

            {/* Hero Card — Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0 }}
              className="flex-1 lg:flex-1 relative bg-gradient-to-br from-maroon to-maroon/80 dark:from-gold dark:to-amber-600 rounded-2xl p-5 lg:p-6 border border-border overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 dark:bg-black/5" />
              <div className="absolute -right-1 -top-1 w-14 h-14 rounded-full bg-white/5 dark:bg-black/5" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-white/15 dark:bg-black/10">
                    <DollarSign className="h-4 w-4 text-white dark:text-dark-bg" />
                  </div>
                  <span className="text-xs font-medium text-white/70 dark:text-dark-bg/70 uppercase tracking-wider">{t.totalRevenue}</span>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-white dark:text-dark-bg tracking-tight">
                  {loading ? "..." : formatPrice(totalRevenue, locale)}
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-800" />
                  <span className="text-xs text-white/60 dark:text-dark-bg/60">
                    {Math.round(revenueRatio * 100)}% delivered
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Active Orders Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
              className="flex-1 lg:flex-1 bg-white dark:bg-dark-card rounded-2xl p-5 lg:p-6 border border-border group hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.pendingOrders}</span>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                {loading ? "..." : totalOrderCount || orders.length}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700 ease-out"
                      style={{ width: `${totalOrderCount > 0 ? (orders.filter(o => o.status === "delivered").length / totalOrderCount) * 100 : 0}%` }}
                />
              </div>
            </motion.div>

            {/* Average Rating Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}
              className="flex-1 lg:flex-1 bg-white dark:bg-dark-card rounded-2xl p-5 lg:p-6 border border-border group hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                  <Star className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.averageRating}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  {loading ? "..." : (averageRating ?? 0).toFixed(1)}
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.round(averageRating ?? 0) ? "fill-gold text-gold" : "text-border"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-gold transition-all duration-700 ease-out"
                  style={{ width: `${(averageRating / 5) * 100}%` }}
                />
              </div>
            </motion.div>

            {/* Quick Nav Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}
              className="hidden lg:flex lg:flex-1 bg-white dark:bg-dark-card rounded-2xl p-5 border border-border flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Access</span>
              </div>
              <div className="space-y-1.5">
                {quickNav.map((nav) => (
                  <Link
                    key={nav.href}
                    href={nav.href}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border"
                  >
                    <span className="flex items-center gap-2">
                      <nav.icon className={`h-3.5 w-3.5 ${nav.color}`} />
                      {nav.label}
                    </span>
                    {nav.count !== null && (
                      <span className="text-[10px] text-muted-foreground/50">{nav.count}</span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.aside>

        {/* ═══════ RIGHT MAIN — Dashboard Panels ═══════ */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex-1 min-w-0 lg:h-full lg:flex lg:flex-col lg:gap-4 overflow-y-auto lg:overflow-hidden"
        >
          {/* Top Row: Avg Order + Inventory Alerts + Total Products */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Avg Order Value */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 shrink-0">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">{tOrders.averageOrder}</span>
                <p className="text-lg font-bold text-foreground tracking-tight truncate">
                  {loading ? "..." : formatPrice(avgOrderValue, locale)}
                </p>
              </div>
            </motion.div>

            {/* Inventory Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">{t.inventoryAlerts}</span>
                <p className="text-[13px] font-medium text-foreground leading-snug">
                  {loading ? "..." : t.inventorySummary
                    .replace("{lowCount}", String(lowStockProducts.length))
                    .replace("{outCount}", String(outOfStockProducts.length))}
                </p>
              </div>
            </motion.div>

            {/* Total Products */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white dark:bg-dark-card rounded-2xl p-5 border border-border flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-maroon/8 dark:bg-gold/15 shrink-0">
                <Flower2 className="h-5 w-5 text-maroon dark:text-gold" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">{tProducts.title}</span>
                <p className="text-lg font-bold text-foreground tracking-tight">
                  {loading ? "..." : products.length}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Scrollable panels area */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
            {/* Recent Orders Table */}
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
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

            {/* Bottom Row: Two-column */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

              {/* Low & Out of Stock */}
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
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

              {/* Recent Reviews */}
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
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
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}