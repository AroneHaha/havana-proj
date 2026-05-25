"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useOrdersStore,
  type OrderStatus,
  STATUS_I18N_KEY,
  type Order,
} from "@/store/orders-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { useSearchFilter } from "@/components/admin/ui/shared/use-search-filter";
import { usePagination } from "@/components/admin/ui/shared/use-pagination";
import { useDateRangeFilter } from "@/components/admin/ui/shared/use-date-range-filter";
import { ITEMS_PER_PAGE, type FilterStatus } from "./constants";
import type { Translation } from "@/i18n/types";

export function useOrdersData() {
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const t = dict.admin.orders;

  const orders = useOrdersStore((s) => s.orders);
  const loading = useOrdersStore((s) => s.loading);
  const storeFetchOrders = useOrdersStore((s) => s.fetchOrders);
  const storeFetchStats = useOrdersStore((s) => s.fetchStats);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const deleteOrder = useOrdersStore((s) => s.deleteOrder);
  const getStatusCounts = useOrdersStore((s) => s.getStatusCounts);
  const getTotalRevenue = useOrdersStore((s) => s.getTotalRevenue);
  const getAverageOrderValue = useOrdersStore((s) => s.getAverageOrderValue);

  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Shared hooks for filter state ──────────────────────────────────
  const search = useSearchFilter({
    onSearchChange: () => pagination.resetPage(),
  });

  const dateRange = useDateRangeFilter({
    onChange: () => pagination.resetPage(),
  });

  const pagination = usePagination({
    totalItems: 0, // will be overridden by filteredOrders.length
    itemsPerPage: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    storeFetchOrders();
    storeFetchStats();
  }, [storeFetchOrders, storeFetchStats]);

  const statusCounts = getStatusCounts();
  const totalRevenue = getTotalRevenue();
  const avgOrder = getAverageOrderValue();

  // ── Filtered orders (search + status + date range) ─────────────────
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (activeFilter !== "all") result = result.filter((o) => o.status === activeFilter);
    if (search.searchQuery.trim()) {
      const q = search.searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) => o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q) || o.customer.phone.includes(q)
      );
    }
    if (dateRange.dateFrom) {
      const from = new Date(dateRange.dateFrom); from.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.createdAt) >= from);
    }
    if (dateRange.dateTo) {
      const to = new Date(dateRange.dateTo); to.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.createdAt) <= to);
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [orders, activeFilter, search.searchQuery, dateRange.dateFrom, dateRange.dateTo]);

  const paginatedOrders = pagination.paginate(filteredOrders);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  // Update pagination total when filtered orders change
  useEffect(() => {
    if (pagination.currentPage > totalPages) {
      pagination.setPage(totalPages);
    }
  }, [totalPages, pagination.currentPage, pagination.setPage]);

  const handleFilterChange = (filter: FilterStatus) => { setActiveFilter(filter); pagination.resetPage(); };
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
    const rows = filteredOrders.map((o) => [o.id, o.customer.name, o.customer.email, o.customer.phone, o.items.map((i) => `${i.productName} x${i.quantity}`).join("; "), o.subtotal.toString(), o.deliveryFee.toString(), o.total.toString(), o.status, "Cash on Delivery", o.notes || "", o.createdAt]);
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

  return {
    t,
    loading,
    searchQuery: search.searchQuery, handleSearchChange: search.setSearchQuery, handleClearSearch: search.clearSearch,
    activeFilter, handleFilterChange,
    currentPage: pagination.currentPage, setCurrentPage: pagination.setPage,
    selectedOrder, setSelectedOrder, drawerOpen, setDrawerOpen,
    deleteConfirm, setDeleteConfirm,
    dateFrom: dateRange.dateFrom, handleDateFromChange: dateRange.setDateFrom,
    dateTo: dateRange.dateTo, handleDateToChange: dateRange.setDateTo,
    activeDatePreset: dateRange.activePreset, hasDateFilter: dateRange.hasDateFilter,
    filteredOrders, paginatedOrders, totalPages,
    orders, statusCounts, totalRevenue, avgOrder,
    handleViewOrder, handleUpdateStatus, handleDeleteOrder,
    handleDatePreset: dateRange.applyPreset, clearDateFilter: dateRange.clearDate, exportCSV,
    formatDate, itemCount, getTabLabel,
  };
}

export type OrdersT = Translation["admin"]["orders"];
