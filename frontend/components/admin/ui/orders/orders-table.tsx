"use client";

import { Eye, Trash2, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
import { STATUS_I18N_KEY, type Order, type PaymentMethod } from "@/store/orders-store";
import { formatPrice } from "@/lib/format-price";
import type { Locale } from "@/i18n";
import { ORDER_STATUS_COLORS, ORDER_STATUS_DOT_COLORS } from "@/lib/constant";
import { DateRangeBar } from "@/components/admin/ui/shared/date-range-bar";
import { Pagination } from "@/components/admin/ui/shared/pagination";
import type { OrdersT } from "./use-orders-data";

function SkeletonRow() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></td>
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-3 w-40 rounded bg-muted animate-pulse" />
        </div>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 w-12 rounded bg-muted animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-muted animate-pulse" /></td>
      <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></td>
      <td className="px-6 py-4 hidden lg:table-cell"><div className="h-3 w-28 rounded bg-muted animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-muted animate-pulse ml-auto" /></td>
    </tr>
  );
}

interface OrdersTableProps {
  t: OrdersT;
  locale: Locale;
  loading?: boolean;
  isFetching?: boolean;
  paginatedOrders: Order[];
  filteredOrdersCount: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
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
  locale,
  loading = false,
  isFetching = false,
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

  const getPaymentLabel = (_method: PaymentMethod) => {
    // Cash on delivery is the only payment method
    return t.cashOnDelivery;
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl border border-border ring-1 ring-black/[0.03] dark:ring-white/[0.03] shadow-elevated overflow-hidden flex-1 min-h-0 flex flex-col">
      {/* Date Range Bar — uses shared DateRangeBar */}
      <DateRangeBar
        dateFrom={dateFrom}
        dateTo={dateTo}
        activePreset={activeDatePreset}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
        onPresetChange={onDatePreset}
        onClear={onClearDate}
        labels={{
          today: t.today,
          last7Days: t.last7Days,
          last30Days: t.last30Days,
          custom: t.clearDate ? "Custom" : undefined,
        }}
      />

      {/* Table body — with loading overlay for page changes */}
      <div className="overflow-y-auto flex-1 min-h-0 relative">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-inset sticky top-0 z-10">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.orderID}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.customer}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{t.items}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.total}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.status}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">{t.paymentMethod}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{t.date}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t.noOrders}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 table-row-hover group"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-maroon dark:text-gold">#{order.orderNumber || order.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm text-foreground">{itemCount(order.items)}</span>
                    <span className="text-xs text-muted-foreground ms-1">{t.items.toLowerCase()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{formatPrice(order.total, locale)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shadow-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ORDER_STATUS_DOT_COLORS[order.status]}`} />
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CreditCard className="w-3.5 h-3.5" />
                      {getPaymentLabel(order.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-xs text-muted-foreground">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:shadow-xs cursor-pointer ring-1 ring-transparent hover:ring-blue-200 dark:hover:ring-blue-800/30"
                        title={t.viewDetails}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {deleteConfirm === order.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer shadow-sm ring-1 ring-red-400/30"
                          >
                            &#10003;
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 rounded text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer ring-1 ring-border"
                          >
                            &#10005;
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(order.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all duration-200 hover:shadow-xs cursor-pointer ring-1 ring-transparent hover:ring-red-200 dark:hover:ring-red-800/30"
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

      {/* Loading overlay — shown when fetching a new page (not initial load) */}
      {isFetching && !loading && paginatedOrders.length > 0 && (
        <div className="absolute inset-0 bg-white/60 dark:bg-dark-bg/60 backdrop-blur-[2px] flex items-center justify-center z-20 transition-opacity duration-200">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-dark-card shadow-lg border border-border">
            <Loader2 className="w-4 h-4 text-maroon dark:text-gold animate-spin" />
            <span className="text-xs font-medium text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}
      </div>

      {/* Pagination — always show when there are orders across pages */}
      {filteredOrdersCount > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          disabled={isFetching}
          showingCount={paginatedOrders.length}
          totalCount={filteredOrdersCount}
          labels={{
            showing: t.showing,
            page: t.page,
          }}
        />
      )}
    </div>
  );
}
