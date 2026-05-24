"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useOrdersData } from "./use-orders-data";
import { StatsCards } from "./stats-cards";
import { OrdersFilterBar } from "./orders-filter-bar";
import { OrdersTable } from "./orders-table";
import { OrderDetailDrawer } from "./order-detail-drawer";

export function AdminOrders() {
  const {
    t,
    loading,
    searchQuery, handleSearchChange, handleClearSearch,
    activeFilter, handleFilterChange,
    currentPage, setCurrentPage,
    selectedOrder, setSelectedOrder, drawerOpen, setDrawerOpen,
    deleteConfirm, setDeleteConfirm,
    dateFrom, handleDateFromChange,
    dateTo, handleDateToChange,
    activeDatePreset, hasDateFilter,
    filteredOrders, paginatedOrders, totalPages,
    orders, statusCounts, totalRevenue, avgOrder,
    handleViewOrder, handleUpdateStatus, handleDeleteOrder,
    handleDatePreset, clearDateFilter, exportCSV,
    formatDate, itemCount, getTabLabel,
  } = useOrdersData();

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

      <StatsCards
        t={t}
        ordersCount={orders.length}
        totalRevenue={totalRevenue}
        avgOrder={avgOrder}
        pendingCount={statusCounts.pending}
      />

      <OrdersFilterBar
        t={t}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        ordersLength={orders.length}
        statusCounts={statusCounts}
        getTabLabel={getTabLabel}
      />

      <OrdersTable
        t={t}
        loading={loading}
        paginatedOrders={paginatedOrders}
        filteredOrdersCount={filteredOrders.length}
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

      <OrderDetailDrawer
        order={selectedOrder}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedOrder(null); }}
        onUpdateStatus={handleUpdateStatus}
        t={t}
      />
    </motion.div>
  );
}

export default AdminOrders;