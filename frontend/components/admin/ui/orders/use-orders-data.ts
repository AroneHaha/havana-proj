"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useOrdersStore,
  type OrderStatus,
  type PaymentMethod,
  STATUS_I18N_KEY,
  type Order,
  ORDERS_PER_PAGE,
} from "@/store/orders-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { useSearchFilter } from "@/components/admin/ui/shared/use-search-filter";
import { useDateRangeFilter } from "@/components/admin/ui/shared/use-date-range-filter";
import type { Translation } from "@/i18n/types";

export type FilterStatus = "all" | OrderStatus;

/**
 * Hook that drives server-side pagination for the Orders module.
 *
 * Architecture:
 *   - The Zustand store fetches ONE page at a time from the Laravel API.
 *   - Filters (status, search, dateFrom, dateTo) are sent as query params
 *     so the database does the filtering — no client-side re-filtering.
 *   - Stats (revenue, counts) come from a dedicated /stats endpoint and
 *     reflect the FULL dataset, not just the current page.
 *   - Navigation triggers a new API call for that specific page.
 */
export function useOrdersData() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const t = dict.admin.orders;

  // ── Store state (server-paginated) ────────────────────────────────
  const orders = useOrdersStore((s) => s.orders);
  const loading = useOrdersStore((s) => s.loading);
  const isFetching = useOrdersStore((s) => s.isFetching);
  const totalOrders = useOrdersStore((s) => s.totalOrders);
  const currentPage = useOrdersStore((s) => s.currentPage);
  const totalPages = useOrdersStore((s) => s.totalPages);
  const storeFetchOrders = useOrdersStore((s) => s.fetchOrders);
  const storeFetchStats = useOrdersStore((s) => s.fetchStats);
  const storeSetFilters = useOrdersStore((s) => s.setFilters);
  const storeSetPage = useOrdersStore((s) => s.setPage);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const deleteOrder = useOrdersStore((s) => s.deleteOrder);
  const getStatusCounts = useOrdersStore((s) => s.getStatusCounts);
  const getTotalRevenue = useOrdersStore((s) => s.getTotalRevenue);
  const getAverageOrderValue = useOrdersStore((s) => s.getAverageOrderValue);

  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Search + Date filters (local state, synced to store) ────────
  const search = useSearchFilter();
  const dateRange = useDateRangeFilter();

  // Debounced search — update store filters after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      storeSetFilters({ search: search.searchQuery || undefined });
    }, 400);
    return () => clearTimeout(timer);
  }, [search.searchQuery, storeSetFilters]);

  // Date filter — sync to store immediately
  useEffect(() => {
    storeSetFilters({
      dateFrom: dateRange.dateFrom || undefined,
      dateTo: dateRange.dateTo || undefined,
    });
  }, [dateRange.dateFrom, dateRange.dateTo, storeSetFilters]);

  // Initial fetch
  useEffect(() => {
    storeFetchOrders();
    storeFetchStats();
  }, [storeFetchOrders, storeFetchStats]);

  // ── Filter handlers ──────────────────────────────────────────────
  const handleFilterChange = useCallback((filter: FilterStatus) => {
    setActiveFilter(filter);
    storeSetFilters({ status: filter === "all" ? undefined : filter });
  }, [storeSetFilters]);

  const handleSearchChange = useCallback((value: string) => {
    search.setSearchQuery(value);
  }, [search.setSearchQuery]);

  const handleDateFromChange = useCallback((value: string) => {
    dateRange.setDateFrom(value);
  }, [dateRange.setDateFrom]);

  const handleDateToChange = useCallback((value: string) => {
    dateRange.setDateTo(value);
  }, [dateRange.setDateTo]);

  const handleDatePreset = useCallback((preset: "today" | "7d" | "30d") => {
    dateRange.applyPreset(preset);
  }, [dateRange.applyPreset]);

  const clearDateFilter = useCallback(() => {
    dateRange.clearDate();
    storeSetFilters({ dateFrom: undefined, dateTo: undefined });
  }, [dateRange.clearDate, storeSetFilters]);

  // ── Stats (from dedicated endpoint, covers FULL dataset) ──────────
  const statusCounts = getStatusCounts();
  const totalRevenue = getTotalRevenue();
  const avgOrder = getAverageOrderValue();

  // ── Actions ──────────────────────────────────────────────────────
  const handleViewOrder = (order: Order) => { setSelectedOrder(order); setDrawerOpen(true); };

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      if (selectedOrder?.id === id) setSelectedOrder((prev) => prev ? { ...prev, status, updatedAt: new Date().toISOString() } : null);
    } catch {}
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id); setDeleteConfirm(null);
      if (selectedOrder?.id === id) { setDrawerOpen(false); setSelectedOrder(null); }
    } catch {}
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Customer", "Email", "Phone", "Items", "Subtotal", "Delivery Fee", "Total", "Status", "Payment", "Notes", "Created At"];
    const rows = orders.map((o) => [o.orderNumber || o.id, o.customer.name, o.customer.email, o.customer.phone, o.items.map((i) => `${i.productName} x${i.quantity}`).join("; "), o.subtotal.toString(), o.deliveryFee.toString(), o.total.toString(), o.status, "Cash on Delivery", o.notes || "", o.createdAt]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `havana-orders-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-KW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const itemCount = (items: Order["items"]) => items.reduce((sum, i) => sum + i.quantity, 0);

  const getTabLabel = (filter: FilterStatus): string => {
    if (filter === "all") return t.all;
    return t[STATUS_I18N_KEY[filter] as keyof typeof t] as string;
  };

  // Active date preset for the UI
  const activeDatePreset = dateRange.activePreset;
  const hasDateFilter = dateRange.hasDateFilter;

  return {
    t,
    loading,
    isFetching,
    searchQuery: search.searchQuery, handleSearchChange, handleClearSearch: search.clearSearch,
    activeFilter, handleFilterChange,
    currentPage, setCurrentPage: storeSetPage,
    selectedOrder, setSelectedOrder, drawerOpen, setDrawerOpen,
    deleteConfirm, setDeleteConfirm,
    dateFrom: dateRange.dateFrom, handleDateFromChange,
    dateTo: dateRange.dateTo, handleDateToChange,
    activeDatePreset, hasDateFilter,
    // Orders from the current page only (server-paginated)
    filteredOrders: orders,
    paginatedOrders: orders,
    filteredOrdersCount: totalOrders,
    totalPages,
    totalOrders,
    orders, statusCounts, totalRevenue, avgOrder,
    handleViewOrder, handleUpdateStatus, handleDeleteOrder,
    handleDatePreset, clearDateFilter, exportCSV,
    formatDate, itemCount, getTabLabel,
  };
}

export type OrdersT = Translation["admin"]["orders"];
