"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { useOrdersData } from "./use-orders-data";
import { useLanguageStore } from "@/store/language-store";
import { formatPrice } from "@/lib/format-price";
import { ORDER_FILTER_TABS, ORDER_STATUS_DOT_COLORS } from "@/lib/constant";
import { SearchInput } from "@/components/admin/ui/shared/search-input";
import { OrdersTable } from "./orders-table";
import { OrderDetailDrawer } from "./order-detail-drawer";
import type { FilterStatus } from "./constants";

export function AdminOrders() {
  const {
    t,
    loading,
    isFetching,
    searchQuery, handleSearchChange,
    activeFilter, handleFilterChange,
    currentPage, setCurrentPage,
    selectedOrder, setSelectedOrder, drawerOpen, setDrawerOpen,
    deleteConfirm, setDeleteConfirm,
    dateFrom, handleDateFromChange,
    dateTo, handleDateToChange,
    activeDatePreset, hasDateFilter,
    filteredOrders, paginatedOrders, totalPages,
    totalOrders, orders, statusCounts, totalRevenue, avgOrder,
    handleViewOrder, handleUpdateStatus, handleDeleteOrder,
    handleDatePreset, clearDateFilter, exportCSV,
    formatDate, itemCount, getTabLabel,
  } = useOrdersData();

  const locale = useLanguageStore((s) => s.locale);

  // Pending ratio for the hero card (uses totalOrders from stats, not just current page)
  const pendingRatio = totalOrders > 0 ? statusCounts.pending / totalOrders : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-card text-sm font-medium text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />{t.exportCSV}
        </button>
      </div>

      {/* ─── Main Layout: Sidebar Stats + Order Workspace ─── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-13rem)]">

        {/* ═══════ LEFT SIDEBAR — Order Stats ═══════ */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:w-64 xl:w-72 shrink-0 lg:h-full"
        >
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-4 lg:h-full">

            {/* Hero Card — Pending Orders (most actionable metric) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0 }}
              className="flex-1 lg:flex-1 relative bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 rounded-2xl p-5 lg:p-6 border border-border overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 dark:bg-black/5" />
              <div className="absolute -right-1 -top-1 w-14 h-14 rounded-full bg-white/5 dark:bg-black/5" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-white/15 dark:bg-black/10">
                    <Clock className="h-4 w-4 text-white dark:text-dark-bg" />
                  </div>
                  <span className="text-xs font-medium text-white/70 dark:text-dark-bg/70 uppercase tracking-wider">{t.pending}</span>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-white dark:text-dark-bg tracking-tight">{statusCounts.pending}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/50 dark:text-dark-bg/50" />
                  <span className="text-xs text-white/60 dark:text-dark-bg/60">{totalOrders > 0 ? `${Math.round(pendingRatio * 100)}% of orders` : "No orders yet"}</span>
                </div>
              </div>
            </motion.div>

            {/* Revenue Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
              className="flex-1 lg:flex-1 bg-white dark:bg-dark-card rounded-2xl p-5 lg:p-6 border border-border group hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.revenue}</span>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">{formatPrice(totalRevenue, locale)}</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700 ease-out"
                  style={{ width: `${totalOrders > 0 ? Math.min(100, (statusCounts.delivered / totalOrders) * 100) : 0}%` }}
                />
              </div>
            </motion.div>

            {/* Avg Order Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}
              className="flex-1 lg:flex-1 bg-white dark:bg-dark-card rounded-2xl p-5 lg:p-6 border border-border group hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.averageOrder}</span>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">{formatPrice(avgOrder, locale)}</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700 ease-out"
                  style={{ width: `${totalRevenue > 0 ? Math.min(100, (avgOrder / totalRevenue) * 100 * totalOrders) : 0}%` }}
                />
              </div>
            </motion.div>

            {/* Quick Filter Card — Status filters */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}
              className="hidden lg:flex lg:flex-1 bg-white dark:bg-dark-card rounded-2xl p-5 border border-border flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Filter</span>
              </div>
              <div className="space-y-1 overflow-y-auto flex-1">
                {ORDER_FILTER_TABS.map((filter) => {
                  const count = filter === "all" ? totalOrders : statusCounts[filter];
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange(filter as FilterStatus)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? "bg-maroon/10 dark:bg-gold/10 text-maroon dark:text-gold border border-maroon/20 dark:border-gold/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {filter !== "all" && (
                          <span className={`w-1.5 h-1.5 rounded-full ${ORDER_STATUS_DOT_COLORS[filter]}`} />
                        )}
                        {getTabLabel(filter as FilterStatus)}
                      </span>
                      <span className={`text-[10px] ${
                        isActive ? "text-maroon/60 dark:text-gold/60" : "text-muted-foreground/50"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.aside>

        {/* ═══════ RIGHT MAIN — Order Workspace ═══════ */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex-1 min-w-0 lg:h-full lg:flex lg:flex-col lg:gap-4"
        >
          {/* Search Row */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-border p-4 space-y-3">
            {/* Mobile: filter tabs (sidebar handles desktop) */}
            <div className="flex items-center gap-3 lg:hidden overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5 pb-1 min-w-max">
                {ORDER_FILTER_TABS.map((filter) => {
                  const count = filter === "all" ? totalOrders : statusCounts[filter];
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange(filter as FilterStatus)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                        isActive
                          ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg border-maroon dark:border-gold shadow-sm"
                          : "bg-white dark:bg-dark-card border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-xs"
                      }`}
                    >
                      {filter !== "all" && (
                        <span className={`w-1.5 h-1.5 rounded-full ${ORDER_STATUS_DOT_COLORS[filter]}`} />
                      )}
                      {getTabLabel(filter as FilterStatus)}
                      <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                        isActive
                          ? "bg-white/20 dark:bg-dark-bg/20"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t.search}
            />
          </div>

          {/* Orders Table */}
          <div className="flex-1 min-h-0 flex flex-col">
            <OrdersTable
              t={t}
              locale={locale}
              loading={loading}
              isFetching={isFetching}
              paginatedOrders={paginatedOrders}
              filteredOrdersCount={totalOrders}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onViewOrder={handleViewOrder}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              onDeleteOrder={handleDeleteOrder}
              formatDate={formatDate}
              itemCount={itemCount}
              dateFrom={dateFrom}
              onDateFromChange={handleDateFromChange}
              dateTo={dateTo}
              onDateToChange={handleDateToChange}
              activeDatePreset={activeDatePreset}
              onDatePreset={handleDatePreset}
              onClearDate={clearDateFilter}
              hasDateFilter={hasDateFilter}
            />
          </div>
        </motion.div>
      </div>

      <OrderDetailDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedOrder(null); }}
        onUpdateStatus={handleUpdateStatus}
        t={t}
        locale={locale}
      />
    </motion.div>
  );
}

export default AdminOrders;
