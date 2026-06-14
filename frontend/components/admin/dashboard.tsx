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
  Leaf,
  Heart,
  Sparkles,
  TrendingDown,
  PackageOpen,
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

  // Quick nav items
  const quickNav = [
    { href: "/orders", label: tOrders.title, icon: ShoppingBag, count: orders.length, color: "text-rose-500", gradient: "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/10", border: "border-rose-100 dark:border-rose-900/30" },
    { href: "/products", label: tProducts.title, icon: Flower2, count: products.length, color: "text-emerald-500", gradient: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/10", border: "border-emerald-100 dark:border-emerald-900/30" },
    { href: "/sales-reviews", label: tReviews.title, icon: BarChart3, count: null, color: "text-amber-500", gradient: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/10", border: "border-amber-100 dark:border-amber-900/30" },
  ];

  // Motivational subtitle based on data state
  const motivationalSubtitle = useMemo(() => {
    if (loading) return "...";
    if (activeOrders.length > 0) return "Your garden is blooming today — bouquets are on their way";
    if (orders.length === 0) return "A new season awaits — let's plant the seeds of success";
    return "Every petal tells a story — your shop is thriving";
  }, [loading, activeOrders.length, orders.length]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, delay: i * 0.07, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* ═══════════════════════════════════════════════════════════════
          1. HEADER SECTION — Warm greeting with flower imagery
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative">
        {/* Decorative background bloom */}
        <div className="absolute -right-4 -top-8 w-40 h-40 bg-rose-100/40 dark:bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -top-12 w-32 h-32 bg-amber-100/30 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            {/* Flower decorative icon */}
            <div className="mt-1 p-2.5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 border border-rose-100 dark:border-rose-900/30">
              <Flower2 className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="font-serif text-2xl lg:text-[28px] font-bold text-foreground tracking-tight">
                {t.title}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {t.subtitle.replace("{name}", user?.firstName ?? "")}
              </p>
              <p className="text-xs mt-1.5 text-rose-500/70 dark:text-rose-400/60 italic flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {motivationalSubtitle}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground mt-2">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{dateStr}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          2. HERO STATS BAR — Four flower-themed stat cards
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue — Rose / Pink */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-900/30 overflow-hidden group hover:shadow-lg hover:shadow-rose-100/50 dark:hover:shadow-rose-950/20 transition-all duration-300"
        >
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-rose-200/30 dark:bg-rose-800/10" />
          <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-rose-200/20 dark:bg-rose-800/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                <DollarSign className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-[11px] font-semibold text-rose-600/70 dark:text-rose-400/70 uppercase tracking-wider">{t.totalRevenue}</span>
            </div>
            <p className="text-2xl font-bold text-rose-900 dark:text-rose-100 tracking-tight">
              {loading ? "..." : formatPrice(totalRevenue, locale)}
            </p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <ArrowUpRight className="w-3 h-3 text-rose-400 dark:text-rose-500" />
              <span className="text-[11px] text-rose-500/70 dark:text-rose-400/60">
                {Math.round(revenueRatio * 100)}% delivered
              </span>
            </div>
          </div>
        </motion.div>

        {/* Total Orders — Amber / Warm */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/30 overflow-hidden group hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-950/20 transition-all duration-300"
        >
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-amber-200/30 dark:bg-amber-800/10" />
          <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-amber-200/20 dark:bg-amber-800/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-semibold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider">{t.pendingOrders}</span>
            </div>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 tracking-tight">
              {loading ? "..." : totalOrderCount || orders.length}
            </p>
            <div className="mt-2.5 h-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-400 transition-all duration-700 ease-out"
                style={{ width: `${totalOrderCount > 0 ? (orders.filter(o => o.status === "delivered").length / totalOrderCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Products in Bloom — Emerald / Green */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 overflow-hidden group hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-emerald-950/20 transition-all duration-300"
        >
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-emerald-200/30 dark:bg-emerald-800/10" />
          <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-emerald-200/20 dark:bg-emerald-800/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Flower2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider">{tProducts.title}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 tracking-tight">
                {loading ? "..." : products.length}
              </p>
              <span className="text-xs text-emerald-600/60 dark:text-emerald-400/60 italic">in bloom</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-emerald-400 dark:text-emerald-500" />
              <span className="text-[11px] text-emerald-500/70 dark:text-emerald-400/60">
                {lowStockProducts.length > 0
                  ? `${lowStockProducts.length} need attention`
                  : "All thriving"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Customer Love — Gold / Amber */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20 rounded-2xl p-5 border border-yellow-100 dark:border-yellow-900/30 overflow-hidden group hover:shadow-lg hover:shadow-yellow-100/50 dark:hover:shadow-yellow-950/20 transition-all duration-300"
        >
          <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-yellow-200/30 dark:bg-yellow-800/10" />
          <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-yellow-200/20 dark:bg-yellow-800/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                <Heart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-semibold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider">{t.averageRating}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 tracking-tight">
                {loading ? "..." : (averageRating ?? 0).toFixed(1)}
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.round(averageRating ?? 0) ? "fill-gold text-gold" : "text-amber-200 dark:text-amber-800"}`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2.5 h-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-gold dark:from-amber-500 dark:to-gold transition-all duration-700 ease-out"
                style={{ width: `${(averageRating / 5) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          3. MIDDLE SECTION — Two-column layout
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* ─── LEFT COLUMN (wider): Recent Bouquets & Orders ─── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="xl:col-span-3"
        >
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-rose-50/50 to-transparent dark:from-rose-950/10 dark:to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <ShoppingBag className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">{t.recentOrders}</h2>
              </div>
              <Link
                href="/orders"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-maroon dark:hover:text-gold transition-colors"
              >
                {t.viewAll}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-5 space-y-2.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <Flower2 className="h-8 w-8 mx-auto text-rose-200 dark:text-rose-800 mb-3" />
                  <p className="text-sm text-muted-foreground">{tOrders.noOrders}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 italic">Your first bouquet order will appear here</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{t.order}</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{t.customer}</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider hidden sm:table-cell">{t.product}</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{t.amount}</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/40 last:border-0 hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors duration-150">
                        <td className="px-5 py-3 text-sm font-medium text-foreground">#{order.orderNumber || order.id}</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{order.customer.name}</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell truncate max-w-[140px]">
                          {order.items[0]?.productName}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-foreground">{formatPrice(order.total, locale)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
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
        </motion.div>

        {/* ─── RIGHT COLUMN: Shop Health — Stacked panels ─── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="xl:col-span-2 flex flex-col gap-5"
        >

          {/* Panel A: Garden Alerts */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/10 dark:to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Leaf className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">{t.inventoryAlerts}</h2>
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
                <div className="p-10 text-center">
                  <Leaf className="h-7 w-7 mx-auto text-emerald-200 dark:text-emerald-800 mb-2" />
                  <p className="text-sm text-muted-foreground">{tProducts.noProducts}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 italic">Your garden is fully stocked</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{tProducts.productName}</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{tProducts.stock}</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{tProducts.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...lowStockProducts, ...outOfStockProducts].slice(0, 5).map((product) => {
                      const status = getStockStatus(product);
                      const statusConfig = status === "low_stock"
                        ? { label: tProducts.lowStock, color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <TrendingDown className="h-3 w-3 mr-1" /> }
                        : { label: tProducts.soldOut, color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", icon: <PackageOpen className="h-3 w-3 mr-1" /> };
                      return (
                        <tr key={product.id} className="border-b border-border/40 last:border-0 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors duration-150">
                          <td className="px-5 py-3 text-sm font-medium text-foreground truncate max-w-[120px]">{product.name}</td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-semibold text-foreground">{product.stock}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium ${statusConfig.color}`}>
                              {statusConfig.icon}
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

          {/* Panel B: Customer Whispers */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-950/10 dark:to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Star className="h-3.5 w-3.5 text-gold" />
                </div>
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
                <div className="p-10 text-center">
                  <Heart className="h-7 w-7 mx-auto text-rose-200 dark:text-rose-800 mb-2" />
                  <p className="text-sm text-muted-foreground">{tReviews.noReviews}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 italic">Waiting for the first whisper of love</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{tReviews.customer}</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{tReviews.rating}</th>
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{tReviews.visibility}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReviews.map((review) => (
                      <tr key={review.id} className="border-b border-border/40 last:border-0 hover:bg-yellow-50/30 dark:hover:bg-yellow-950/10 transition-colors duration-150">
                        <td className="px-5 py-3 text-sm font-medium text-foreground">{review.customerName}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                            <span className="text-sm font-medium text-foreground">{review.rating}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-medium capitalize ${getVisibilityColor(review.visibility)}`}>
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
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          4. QUICK ACCESS — Elegant navigation tiles
      ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Quick Access</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickNav.map((nav, i) => (
            <motion.div
              key={nav.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.45 + i * 0.06 }}
            >
              <Link
                href={nav.href}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br ${nav.gradient} border ${nav.border} hover:shadow-md transition-all duration-300 cursor-pointer`}
              >
                {/* Decorative background circle */}
                <div className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full bg-white/20 dark:bg-black/5 pointer-events-none" />

                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-dark-card/60 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <nav.icon className={`h-5 w-5 ${nav.color}`} />
                </div>
                <div className="min-w-0 relative">
                  <p className="text-sm font-semibold text-foreground truncate">{nav.label}</p>
                  {nav.count !== null && (
                    <p className="text-xs text-muted-foreground mt-0.5">{nav.count} items</p>
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 ml-auto shrink-0 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
