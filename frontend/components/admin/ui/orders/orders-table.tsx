"use client";

import { Eye, Trash2, ShoppingBag, CreditCard, X, ChevronLeft, ChevronRight } from "lucide-react";
import { STATUS_I18N_KEY, type Order } from "@/store/orders-store";
import { formatPrice } from "@/lib/format-price";
import { statusColors, statusDotColors, ITEMS_PER_PAGE } from "./constants";
import type { OrdersT } from "./use-orders-data";

interface OrdersTableProps {
  t: OrdersT;
  paginatedOrders: Order[];
  filteredOrdersCount: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  onViewOrder: (order: Order) => void;
  deleteConfirm: string | null;
  setDeleteConfirm: (id: string | null) => void;
  onDeleteOrder: (id: string) => Promise<void>;
  formatDate: (dateStr: string) => string;
  itemCount: (items: Order["items"]) => number;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  activeDatePreset: "today" | "7d" | "30d" | null;
  onDatePreset: (preset: "today" | "7d" | "30d") => void;
  onClearDate: () => void;
  hasDateFilter: boolean;
}

export function OrdersTable({
  t,
  paginatedOrders,
  filteredOrdersCount,
  currentPage,
  totalPages,
  setCurrentPage,
  onViewOrder,
  deleteConfirm,
  setDeleteConfirm,
  onDeleteOrder,
  formatDate,
  itemCount,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  activeDatePreset,
  onDatePreset,
  onClearDate,
  hasDateFilter,
}: OrdersTableProps) {
  const getStatusLabel = (status: string) => {
    return t[STATUS_I18N_KEY[status as keyof typeof STATUS_I18N_KEY] as keyof typeof t] as string;
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-border overflow-hidden">
      {/* Date Range Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30 gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {([
            { key: "today" as const, label: t.today },
            { key: "7d" as const, label: t.last7Days },
            { key: "30d" as const, label: t.last30Days },
          ]).map((preset) => (
            <button
              key={preset.key}
              onClick={() => onDatePreset(preset.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeDatePreset === preset.key
                  ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg"
                  : "bg-white dark:bg-dark-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {preset.label}
            </button>
          ))}
          {hasDateFilter && !activeDatePreset && (
            <span className="text-xs text-muted-foreground px-1">Custom</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow"
          />
          <span className="text-xs text-muted-foreground">&rarr;</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow"
          />
          {hasDateFilter && (
            <button
              onClick={onClearDate}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
              title={t.clearDate}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.orderID}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.customer}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t.items}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.total}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.status}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t.paymentMethod}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t.date}</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">{t.noOrders}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-maroon dark:text-gold">#{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-foreground">{itemCount(order.items)}</span>
                    <span className="text-xs text-muted-foreground ml-1">{t.items.toLowerCase()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[order.status]}`} />
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CreditCard className="w-3.5 h-3.5" />
                      {t.cash}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-xs text-muted-foreground">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                        title={t.viewDetails}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {deleteConfirm === order.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                          >
                            &#10003;
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 rounded text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            &#10005;
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(order.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors cursor-pointer"
                          title={t.deleteOrder}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredOrdersCount > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t.showing.replace("{count}", String(paginatedOrders.length)).replace("{total}", String(filteredOrdersCount))}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground px-2">
              {t.page.replace("{current}", String(currentPage)).replace("{total}", String(totalPages))}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}