"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Package, ChevronDown, X, ArrowUpRight, CalendarDays } from "lucide-react";
import { useSalesStore } from "@/store/sales-store";
import { useReviewsStore } from "@/store/review-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { formatPrice } from "@/lib/format-price";
import { SearchInput, Pagination } from "@/components/admin/ui/shared";
import { SalesTable } from "./sales-table";
import { SalesDetailView } from "./sales-detail-view";
import type { Order } from "@/services/orders-service";

export function SalesReviewsPage() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const t = dict.admin.salesReviews;

  // ─── Sales data (from dedicated sales store) ────────────────────────
  const salesOrders = useSalesStore((s) => s.orders);
  const salesStats = useSalesStore((s) => s.stats);
  const salesFilterOptions = useSalesStore((s) => s.filterOptions);
  const salesLoading = useSalesStore((s) => s.loading);
  const salesFetching = useSalesStore((s) => s.isFetching);
  const storeFetchSales = useSalesStore((s) => s.fetchSales);
  const salesSetFilters = useSalesStore((s) => s.setFilters);
  const salesClearFilters = useSalesStore((s) => s.clearFilters);
  const salesFilters = useSalesStore((s) => s.filters);
  const salesCurrentPage = useSalesStore((s) => s.currentPage);
  const salesTotalPages = useSalesStore((s) => s.totalPages);
  const salesTotalCount = useSalesStore((s) => s.totalOrders);

  // ─── Reviews data ───────────────────────────────────────────────────
  const reviews = useReviewsStore((s) => s.reviews);
  const reviewsLoading = useReviewsStore((s) => s.loading);
  const storeFetchReviews = useReviewsStore((s) => s.fetchReviews);
  const storeFetchStats = useReviewsStore((s) => s.fetchStats);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Local UI state for date preset toggle (not sent to API directly)
  const [activeDatePreset, setActiveDatePreset] = useState<"today" | "7d" | "30d" | null>(null);
  const [localYear, setLocalYear] = useState<number>(0);
  const [localMonth, setLocalMonth] = useState<number>(0);
  const [localSearch, setLocalSearch] = useState("");
  const [localProduct, setLocalProduct] = useState("all");

  // ─── Initial fetch ──────────────────────────────────────────────────
  useEffect(() => {
    storeFetchSales();
    storeFetchReviews();
    storeFetchStats();
  }, [storeFetchSales, storeFetchReviews, storeFetchStats]);

  const loading = salesLoading;

  // ─── Derived stats ──────────────────────────────────────────────────
  const avgOrderValue =
    salesStats && salesStats.totalOrders > 0
      ? salesStats.totalRevenue / salesStats.totalOrders
      : 0;

  // ─── Available years from server ────────────────────────────────────
  const availableYears = salesFilterOptions.availableYears;
  const productOptions = salesFilterOptions.productOptions;

  // Calendar months for the selected year
  const availableMonthsForYear = (() => {
    if (!localYear) return [];
    const now = new Date();
    const currentYear = now.getFullYear();
    if (localYear === currentYear) {
      return Array.from({ length: now.getMonth() + 1 }, (_, i) => i + 1).reverse();
    }
    return Array.from({ length: 12 }, (_, i) => i + 1).reverse();
  })();

  // Reset month when year changes
  useEffect(() => {
    if (localMonth) setLocalMonth(0);
  }, [localYear]);

  // Whether any date filtering is active
  const hasDateFilter = activeDatePreset || salesFilters.dateFrom || salesFilters.dateTo || salesFilters.year;

  // ─── Date preset handler ────────────────────────────────────────────
  const handleDatePreset = useCallback((preset: "today" | "7d" | "30d") => {
    if (activeDatePreset === preset) {
      // Toggle off → clear date filters
      setActiveDatePreset(null);
      setLocalYear(0);
      setLocalMonth(0);
      salesClearFilters();
    } else {
      const n = new Date();
      const today = n.toISOString().split("T")[0];
      let from = today;

      if (preset === "7d") {
        const d = new Date(n);
        d.setDate(d.getDate() - 6);
        from = d.toISOString().split("T")[0];
      } else if (preset === "30d") {
        const d = new Date(n);
        d.setDate(d.getDate() - 29);
        from = d.toISOString().split("T")[0];
      }

      setActiveDatePreset(preset);
      setLocalYear(0);
      setLocalMonth(0);
      salesSetFilters({ dateFrom: from, dateTo: today, year: undefined, month: undefined });
    }
  }, [activeDatePreset, salesClearFilters, salesSetFilters]);

  // ─── Clear date filter ──────────────────────────────────────────────
  const clearDateFilter = useCallback(() => {
    setActiveDatePreset(null);
    setLocalYear(0);
    setLocalMonth(0);
    salesSetFilters({ dateFrom: undefined, dateTo: undefined, year: undefined, month: undefined });
  }, [salesSetFilters]);

  // ─── Year change handler ────────────────────────────────────────────
  const handleYearChange = useCallback((val: number) => {
    setLocalYear(val);
    setActiveDatePreset(null);
    salesSetFilters({ year: val || undefined, dateFrom: undefined, dateTo: undefined });
  }, [salesSetFilters]);

  // ─── Month change handler ──────────────────────────────────────────
  const handleMonthChange = useCallback((val: number) => {
    setLocalMonth(val);
    setActiveDatePreset(null);
    salesSetFilters({ month: val || undefined });
  }, [salesSetFilters]);

  // ─── Search handler ───────────────────────────────────────────────
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    salesSetFilters({ search: value || undefined });
  }, [salesSetFilters]);

  // ─── Product filter handler ─────────────────────────────────────────
  const handleProductChange = useCallback((value: string) => {
    setLocalProduct(value);
    salesSetFilters({ productId: value !== "all" ? value : undefined });
  }, [salesSetFilters]);

  // ─── Page change handler ───────────────────────────────────────────
  const handlePageChange = useCallback((page: number) => {
    useSalesStore.getState().setPage(page);
  }, []);

  // ─── Format date ────────────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "ar" ? "ar-KW" : "en-KW", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── Detail view ────────────────────────────────────────────────────
  if (selectedOrder) {
    return (
      <SalesDetailView
        order={selectedOrder}
        reviews={reviews}
        onBack={() => setSelectedOrder(null)}
        locale={locale}
        formatDate={formatDate}
        labels={{
          backToSales: t.backToSales,
          saleDetails: t.saleDetails,
          orderInfo: t.orderInfo,
          orderID: t.orderID,
          customer: t.customer,
          date: t.date,
          total: t.total,
          products: t.products,
          reviewsFor: t.reviewsFor,
          quantity: t.quantity,
          noReviewsForProduct: t.noReviewsForProduct,
          discount: "Discount",
          deliveryAddress: "Delivery Address",
        }}
      />
    );
  }

  // ─── List view ──────────────────────────────────────────────────────
  return (
    <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* ─── Main Layout: Sidebar Stats + Transaction Workspace ─── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-13rem)]">

        {/* ═══════ LEFT SIDEBAR — Stats Cards ═══════ */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:w-64 xl:w-72 shrink-0 lg:h-full"
        >
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-4 lg:h-full">
            {/* Revenue Card */}
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
                  {formatPrice(salesStats?.totalRevenue ?? 0, locale)}
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-800" />
                  <span className="text-xs text-white/60 dark:text-dark-bg/60">
                    Avg. {formatPrice(avgOrderValue, locale)} / order
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Orders Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
              className="flex-1 lg:flex-1 bg-white dark:bg-dark-card rounded-2xl p-5 lg:p-6 border border-border group hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.totalOrders}</span>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{salesStats?.totalOrders ?? 0}</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700 ease-out"
                  style={{ width: `${salesStats?.totalOrders ?? 0 > 0 ? 100 : 0}%` }}
                />
              </div>
            </motion.div>

            {/* Products Sold Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}
              className="flex-1 lg:flex-1 bg-white dark:bg-dark-card rounded-2xl p-5 lg:p-6 border border-border group hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500">
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.productsSold}</span>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{salesStats?.productsSold ?? 0}</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-700 ease-out"
                  style={{ width: `${salesStats?.productsSold ?? 0 > 0 ? 100 : 0}%` }}
                />
              </div>
            </motion.div>

            {/* Quick Filter Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}
              className="hidden lg:flex lg:flex-1 bg-white dark:bg-dark-card rounded-2xl p-5 border border-border flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick View</span>
              </div>
              <div className="space-y-1.5">
                {([
                  { key: "today" as const, label: t.today },
                  { key: "7d" as const, label: t.last7Days },
                  { key: "30d" as const, label: t.last30Days },
                ]).map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handleDatePreset(preset.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeDatePreset === preset.key
                        ? "bg-maroon/10 dark:bg-gold/10 text-maroon dark:text-gold border border-maroon/20 dark:border-gold/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.aside>

        {/* ═══════ RIGHT MAIN — Transaction Workspace ═══════ */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex-1 min-w-0 space-y-4 lg:h-full lg:flex lg:flex-col lg:space-y-0 lg:gap-4"
        >
          {/* Search + Filters Row */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-border p-4 space-y-3">
            {/* Search */}
            <SearchInput
              value={localSearch}
              onChange={handleSearchChange}
              placeholder={t.search}
            />

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date presets — mobile only */}
              <div className="flex items-center gap-2 lg:hidden">
                {([
                  { key: "today" as const, label: t.today },
                  { key: "7d" as const, label: t.last7Days },
                  { key: "30d" as const, label: t.last30Days },
                ]).map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handleDatePreset(preset.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      activeDatePreset === preset.key
                        ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg"
                        : "bg-white dark:bg-dark-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom date range indicator */}
              {(salesFilters.dateFrom || salesFilters.dateTo) && !activeDatePreset && (
                <span className="text-xs text-muted-foreground px-1">{t.customDateRange}</span>
              )}

              {/* Clear ALL date filters */}
              {hasDateFilter && (
                <button
                  onClick={clearDateFilter}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
                  title={t.clearDate}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Year filter */}
              <div className="relative">
                <select
                  value={localYear || ""}
                  onChange={(e) => handleYearChange(Number(e.target.value) || 0)}
                  disabled={!!activeDatePreset}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{t.allYears}</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Month filter */}
              {localYear > 0 && (
                <div className="relative">
                  <select
                    value={localMonth || ""}
                    onChange={(e) => handleMonthChange(Number(e.target.value) || 0)}
                    disabled={!!activeDatePreset}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{t.allMonths}</option>
                    {availableMonthsForYear.map((m) => (
                      <option key={m} value={m}>
                        {new Intl.DateTimeFormat(locale === "ar" ? "ar-KW" : "en-KW", { month: "long" }).format(new Date(2024, m - 1, 1))}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              )}

              {/* Product filter */}
              <div className="relative ms-auto">
                <select
                  value={localProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer"
                >
                  <option value="all">{t.allProducts}</option>
                  {productOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
            <SalesTable
              loading={loading}
              orders={salesOrders}
              locale={locale}
              formatDate={formatDate}
              onViewOrder={setSelectedOrder}
              viewLabel={t.viewReviews}
              productsLabel={t.products}
              noDataLabel={
                (hasDateFilter || localProduct !== "all" || localSearch.trim())
                  ? t.noTransactionsForPeriod
                  : t.noSales
              }
              headers={{
                orderID: t.orderID,
                customer: t.customer,
                products: t.products,
                total: t.total,
                date: t.date,
                actions: t.actions,
              }}
            />
            </div>

            {salesTotalCount > 0 && (
              <Pagination
                currentPage={salesCurrentPage}
                totalPages={salesTotalPages}
                onPageChange={handlePageChange}
                showingCount={salesOrders.length}
                totalCount={salesTotalCount}
                labels={{ showing: t.showing, page: t.page }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}