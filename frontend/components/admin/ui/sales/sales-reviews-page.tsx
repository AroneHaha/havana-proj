"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Package, ChevronDown, X, ArrowUpRight, CalendarDays } from "lucide-react";
import { useOrdersStore } from "@/store/orders-store";
import { useReviewsStore } from "@/store/review-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { formatPrice } from "@/lib/format-price";
import { SearchInput, Pagination } from "@/components/admin/ui/shared";
import { SalesTable } from "./sales-table";
import { SalesDetailView } from "./sales-detail-view";
import { useSalesFilters, getCalendarMonthsForYear, type SalesFilterState } from "./use-sales-filters";
import type { Order } from "@/store/orders-store";

const ITEMS_PER_PAGE = 8;


export function SalesReviewsPage() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const t = dict.admin.salesReviews;

  const orders = useOrdersStore((s) => s.orders);
  const ordersLoading = useOrdersStore((s) => s.loading);
  const storeFetchOrders = useOrdersStore((s) => s.fetchOrders);
  const reviews = useReviewsStore((s) => s.reviews);
  const reviewsLoading = useReviewsStore((s) => s.loading);
  const storeFetchReviews = useReviewsStore((s) => s.fetchReviews);
  const storeFetchStats = useReviewsStore((s) => s.fetchStats);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters — default: show ALL data (month=0, year=0 = no filter)
  const [filters, setFilters] = useState<SalesFilterState>({
    searchQuery: "",
    productFilter: "all",
    month: 0,
    year: 0,
    dateFrom: "",
    dateTo: "",
    activeDatePreset: null,
  });

  const updateFilter = useCallback(<K extends keyof SalesFilterState>(key: K, value: SalesFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    storeFetchOrders();
    storeFetchReviews();
    storeFetchStats();
  }, [storeFetchOrders, storeFetchReviews, storeFetchStats]);

  const loading = ordersLoading || reviewsLoading;

  // All non-cancelled orders (sales), sorted newest first
  const salesOrders = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  // Shared filtering + stats
  const { filteredSales, paginatedSales, totalPages, stats, availableYears, productOptions } =
    useSalesFilters(salesOrders, filters, ITEMS_PER_PAGE, currentPage);

  // Date preset handlers
  const handleDatePreset = useCallback((preset: "today" | "7d" | "30d") => {
    const n = new Date();
    const today = n.toISOString().split("T")[0];

    if (filters.activeDatePreset === preset) {
      // Toggle off → clear all date filters
      setFilters((prev) => ({
        ...prev,
        dateFrom: "",
        dateTo: "",
        activeDatePreset: null,
        month: 0,
        year: 0,
      }));
    } else {
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
      setFilters((prev) => ({
        ...prev,
        dateFrom: from,
        dateTo: today,
        activeDatePreset: preset,
        month: 0,
        year: 0,
      }));
    }
    setCurrentPage(1);
  }, [filters.activeDatePreset]);

  const clearDateFilter = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      dateFrom: "",
      dateTo: "",
      activeDatePreset: null,
      month: 0,
      year: 0,
    }));
    setCurrentPage(1);
  }, []);

  // Calendar-based months for the selected year (independent of data)
  const availableMonthsForYear = useMemo(() => {
    if (!filters.year) return []; // "All Years" selected — no months to show
    return getCalendarMonthsForYear(filters.year).reverse(); // Most recent month first
  }, [filters.year]);

  // When year changes, reset month to "All Months" since months list changes
  useEffect(() => {
    if (filters.month) {
      setFilters((prev) => ({ ...prev, month: 0 }));
    }
  }, [filters.year]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "ar" ? "ar-KW" : "en-KW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Whether any date filtering is active (year-only counts too)
  const hasDateFilter = filters.activeDatePreset || filters.dateFrom || filters.dateTo || filters.year > 0;

  // Compute average order value for the stat card
  const avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

  // Detail view
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
        }}
      />
    );
  }

  // List view — sidebar + main layout
  return (
    <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* ─── Main Layout: Sidebar Stats + Transaction Workspace ─── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-13rem)]">

        {/* ═══════ LEFT SIDEBAR — Stats Cards (vertical) ═══════ */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:w-64 xl:w-72 shrink-0 lg:h-full"
        >
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-4 lg:h-full">
            {/* Revenue Card — Hero / Featured */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0 }}
              className="flex-1 lg:flex-1 relative bg-gradient-to-br from-maroon to-maroon/80 dark:from-gold dark:to-amber-600 rounded-2xl p-5 lg:p-6 border border-border overflow-hidden flex flex-col justify-between"
            >
              {/* Decorative background element */}
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 dark:bg-black/5" />
              <div className="absolute -right-1 -top-1 w-14 h-14 rounded-full bg-white/5 dark:bg-black/5" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-white/15 dark:bg-black/10">
                    <DollarSign className="h-4 w-4 text-white dark:text-dark-bg" />
                  </div>
                  <span className="text-xs font-medium text-white/70 dark:text-dark-bg/70 uppercase tracking-wider">{t.totalRevenue}</span>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-white dark:text-dark-bg tracking-tight">{formatPrice(stats.totalRevenue, locale)}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-800" />
                  <span className="text-xs text-white/60 dark:text-dark-bg/60">Avg. {formatPrice(avgOrderValue, locale)} / order</span>
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
              <p className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{stats.totalOrders}</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700 ease-out"
                  style={{ width: `${stats.totalOrders > 0 ? Math.min(100, (stats.totalOrders / Math.max(stats.totalOrders, 1)) * 100) : 0}%` }}
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
              <p className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{stats.productsSold}</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-700 ease-out"
                  style={{ width: `${stats.productsSold > 0 ? Math.min(100, (stats.productsSold / Math.max(stats.productsSold + (stats.totalOrders - stats.productsSold), 1)) * 100) : 0}%` }}
                />
              </div>
            </motion.div>

            {/* Quick Filter Card — compact date presets */}
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
                      filters.activeDatePreset === preset.key
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
              value={filters.searchQuery}
              onChange={(v) => updateFilter("searchQuery", v)}
              placeholder={t.search}
            />

            {/* Filters: Date presets (mobile only — desktop uses sidebar) + Year + Month + Product */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Date presets — visible on mobile/tablet (sidebar handles desktop) */}
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
                      filters.activeDatePreset === preset.key
                        ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg"
                        : "bg-white dark:bg-dark-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom date range indicator */}
              {(filters.dateFrom || filters.dateTo) && !filters.activeDatePreset && (
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
                  value={filters.year || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateFilter("year", val ? Number(val) : 0);
                    if (val) updateFilter("activeDatePreset", null);
                  }}
                  disabled={!!filters.activeDatePreset}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{t.allYears}</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Month filter — only shows when a year is selected */}
              {filters.year > 0 && (
                <div className="relative">
                  <select
                    value={filters.month || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateFilter("month", val ? Number(val) : 0);
                      if (val) updateFilter("activeDatePreset", null);
                    }}
                    disabled={!!filters.activeDatePreset}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{t.allMonths}</option>
                    {availableMonthsForYear.map((m) => (
                      <option key={m} value={m}>{new Intl.DateTimeFormat(locale === "ar" ? "ar-KW" : "en-KW", { month: "long" }).format(new Date(2024, m - 1, 1))}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              )}

              {/* Product filter */}
              <div className="relative ms-auto">
                <select
                  value={filters.productFilter}
                  onChange={(e) => updateFilter("productFilter", e.target.value)}
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
              orders={paginatedSales}
              locale={locale}
              formatDate={formatDate}
              onViewOrder={setSelectedOrder}
              viewLabel={t.viewReviews}
              productsLabel={t.products}
              noDataLabel={
                (hasDateFilter || filters.productFilter !== "all" || filters.searchQuery.trim())
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

            {filteredSales.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showingCount={paginatedSales.length}
                totalCount={filteredSales.length}
                labels={{ showing: t.showing, page: t.page }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
