"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Package, ChevronDown, X } from "lucide-react";
import { useOrdersStore } from "@/store/orders-store";
import { useReviewsStore } from "@/store/review-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { formatPrice } from "@/lib/format-price";
import { SearchInput, Pagination } from "@/components/admin/ui/shared";
import { SalesTable } from "./sales-table";
import { SalesDetailView } from "./sales-detail-view";
import { useSalesFilters, type SalesFilterState } from "./use-sales-filters";
import type { Order } from "@/store/orders-store";

const ITEMS_PER_PAGE = 8;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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

  // Current date for defaults
  const now = new Date();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters — default: current month/year
  const [filters, setFilters] = useState<SalesFilterState>({
    searchQuery: "",
    productFilter: "all",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
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
  const { filteredSales, paginatedSales, totalPages, stats, availableMonths, productOptions } =
    useSalesFilters(salesOrders, filters, ITEMS_PER_PAGE, currentPage);

  // Date preset handlers
  const handleDatePreset = useCallback((preset: "today" | "7d" | "30d") => {
    const n = new Date();
    const today = n.toISOString().split("T")[0];

    if (filters.activeDatePreset === preset) {
      // Clear preset, revert to current month/year
      setFilters({
        searchQuery: filters.searchQuery,
        productFilter: filters.productFilter,
        month: n.getMonth() + 1,
        year: n.getFullYear(),
        dateFrom: "",
        dateTo: "",
        activeDatePreset: null,
      });
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
        month: 0, // clear month filter when using preset
        year: 0,
      }));
    }
    setCurrentPage(1);
  }, [filters.activeDatePreset, filters.searchQuery, filters.productFilter]);

  const clearDateFilter = useCallback(() => {
    const n = new Date();
    setFilters((prev) => ({
      ...prev,
      dateFrom: "",
      dateTo: "",
      activeDatePreset: null,
      month: n.getMonth() + 1,
      year: n.getFullYear(),
    }));
    setCurrentPage(1);
  }, []);

  // Available years from the data (for the year dropdown)
  const availableYears = useMemo(() => {
    const years = new Set(availableMonths.map((m) => m.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [availableMonths]);

  // Available months for the selected year
  const availableMonthsForYear = useMemo(() => {
    return availableMonths
      .filter((m) => m.year === filters.year)
      .map((m) => m.month)
      .sort((a, b) => b - a);
  }, [availableMonths, filters.year]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-KW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Detail view
  if (selectedOrder) {
    return (
      <SalesDetailView
        order={selectedOrder}
        reviews={reviews}
        onBack={() => setSelectedOrder(null)}
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
          noReviewsForProduct: t.noReviewsForProduct,
        }}
      />
    );
  }

  // List view
  return (
    <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* ─── Stats grid — 3 cards, larger ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground font-medium">{t.totalOrders}</span>
            <div className="p-2.5 rounded-xl bg-muted/50 text-blue-500"><ShoppingBag className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground font-medium">{t.totalRevenue}</span>
            <div className="p-2.5 rounded-xl bg-muted/50 text-emerald-500"><DollarSign className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatPrice(stats.totalRevenue)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}
          className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground font-medium">{t.productsSold}</span>
            <div className="p-2.5 rounded-xl bg-muted/50 text-purple-500"><Package className="h-5 w-5" /></div>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.productsSold}</p>
        </motion.div>
      </div>

      {/* ─── Search ─── */}
      <div className="mb-4">
        <SearchInput
          value={filters.searchQuery}
          onChange={(v) => updateFilter("searchQuery", v)}
          placeholder={t.search}
        />
      </div>

      {/* ─── Filters: Date presets + Month/Year + Product ─── */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 pb-1 min-w-max flex-wrap">
          {/* Date presets */}
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

          {/* Custom date range indicator */}
          {(filters.dateFrom || filters.dateTo) && !filters.activeDatePreset && (
            <span className="text-xs text-muted-foreground px-1">Custom</span>
          )}

          {/* Clear date filter */}
          {(filters.activeDatePreset || filters.dateFrom || filters.dateTo) && (
            <button
              onClick={clearDateFilter}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
              title={t.clearDate}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Month filter */}
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
              {availableMonthsForYear.map((m) => (
                <option key={m} value={m}>{MONTH_NAMES[m - 1]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

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
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Product filter — far right */}
          <div className="relative ml-auto">
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
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Sales table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
        <SalesTable
          loading={loading}
          orders={paginatedSales}
          formatDate={formatDate}
          onViewOrder={setSelectedOrder}
          viewLabel={t.viewReviews}
          productsLabel={t.products}
          noDataLabel={t.noSales}
          headers={{
            orderID: t.orderID,
            customer: t.customer,
            products: t.products,
            total: t.total,
            date: t.date,
            actions: t.actions,
          }}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showingCount={paginatedSales.length}
          totalCount={filteredSales.length}
          labels={{ showing: t.showing, page: t.page }}
        />
      </div>
    </motion.div>
  );
}
