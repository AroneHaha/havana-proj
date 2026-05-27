"use client";

import { Eye, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import type { Order } from "@/store/orders-store";

function SkeletonRow() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></td>
      <td className="px-4 py-4">
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-3 w-40 rounded bg-muted animate-pulse" />
        </div>
      </td>
      <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 w-12 rounded bg-muted animate-pulse" /></td>
      <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></td>
      <td className="px-4 py-4 hidden lg:table-cell"><div className="h-3 w-28 rounded bg-muted animate-pulse" /></td>
      <td className="px-4 py-4"><div className="h-4 w-8 rounded bg-muted animate-pulse ml-auto" /></td>
    </tr>
  );
}

interface SalesTableProps {
  loading?: boolean;
  orders: Order[];
  formatDate: (dateStr: string) => string;
  onViewOrder: (order: Order) => void;
  viewLabel: string;
  productsLabel: string;
  noDataLabel: string;
  headers: {
    orderID: string;
    customer: string;
    products: string;
    total: string;
    date: string;
    actions: string;
  };
}

export function SalesTable({
  loading = false,
  orders,
  formatDate,
  onViewOrder,
  viewLabel,
  productsLabel,
  noDataLabel,
  headers,
}: SalesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-1/6" />
          <col className="w-1/6" />
          <col className="w-1/6" />
          <col className="w-1/6" />
          <col className="w-1/6" />
          <col className="w-1/6" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-inset">
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.orderID}</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.customer}</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{headers.products}</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.total}</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{headers.date}</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.actions}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">{noDataLabel}</p>
                </div>
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border last:border-0 table-row-hover group"
              >
                <td className="px-4 py-4 text-sm font-semibold text-maroon dark:text-gold">#{order.id}</td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <span className="text-sm text-foreground">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">{productsLabel.toLowerCase()}</span>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-foreground">{formatPrice(order.total)}</td>
                <td className="px-4 py-4 hidden lg:table-cell text-xs text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:shadow-xs cursor-pointer ring-1 ring-transparent hover:ring-blue-200 dark:hover:ring-blue-800/30"
                      title={viewLabel}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}