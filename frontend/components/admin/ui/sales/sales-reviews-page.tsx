"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { useOrdersStore } from "@/store/orders-store";
import { useReviewsStore } from "@/store/review-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { formatPrice } from "@/lib/format-price";
import {
  StatsCard,
  SearchInput,
  DateRangeBar,
  Pagination,
} from "@/components/admin/ui/shared";
import { SalesTable } from "./sales-table";
import { SalesDetailView } from "./sales-detail-view";
import { useSalesFilters } from "./use-sales-filters";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeDatePreset, setActiveDatePreset] = useState<"today" | "7d" | "30d" | null>(null);

  useEffect(() => {
    storeFetchOrders();
    storeFetchReviews();
    storeFetchStats();
  }, [storeFetchOrders, storeFetchReviews, storeFetchStats]);

  const loading = ordersLoading || reviewsLoading;

  // All non-cancelled orders (sales)
  const salesOrders = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  // Stats from delivered orders
  const stats = useMemo(() => {
    const delivered = salesOrders.filter((o) => o.status === "delivered");
    const totalRevenue = delivered.reduce((sum, o) => sum + o.total, 0);
    const totalSales = delivered.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const productsSold = delivered.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, i) => itemSum + i.quantity, 0),
      0
    );
    return { totalRevenue, totalSales, avgOrderValue, productsSold };
  }, [salesOrders]);

  // Filtered & paginated
  const { filteredSales, paginatedSales, totalPages } = useSalesFilters(
    salesOrders, searchQuery, dateFrom, dateTo, ITEMS_PER_PAGE, currentPage
  );

  // Handlers
  const handleDatePreset = (preset: "today" | "7d" | "30d") => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    if (preset === activeDatePreset) {
      clearDateFilter();
      return;
    }
    setActiveDatePreset(preset);
    setDateTo(today);
    setCurrentPage(1);
    if (preset === "today") {
      setDateFrom(today);
    } else if (preset === "7d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      setDateFrom(d.toISOString().split("T")[0]);
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      setDateFrom(d.toISOString().split("T")[0]);
    }
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setActiveDatePreset(null);
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-QA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatsCard label={t.totalRevenue} value={formatPrice(stats.totalRevenue)} icon={DollarSign} color="text-emerald-500" />
        <StatsCard label={t.totalSales} value={stats.totalSales.toString()} icon={ShoppingBag} color="text-blue-500" index={1} />
        <StatsCard label={t.avgOrderValue} value={formatPrice(stats.avgOrderValue)} icon={TrendingUp} color="text-orange-500" index={2} />
        <StatsCard label={t.productsSold} value={stats.productsSold.toString()} icon={Package} color="text-purple-500" index={3} />
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
          placeholder={t.search}
        />
      </div>

      {/* Sales table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
        <DateRangeBar
          dateFrom={dateFrom}
          dateTo={dateTo}
          activePreset={activeDatePreset}
          onDateFromChange={(v) => { setDateFrom(v); setActiveDatePreset(null); setCurrentPage(1); }}
          onDateToChange={(v) => { setDateTo(v); setActiveDatePreset(null); setCurrentPage(1); }}
          onPresetChange={handleDatePreset}
          onClear={clearDateFilter}
          labels={{ today: t.today, last7Days: t.last7Days, last30Days: t.last30Days }}
        />

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