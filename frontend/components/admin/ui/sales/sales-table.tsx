"use client";

import { Eye, ShoppingBag } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/shared";
import { formatPrice } from "@/lib/format-price";
import type { Order } from "@/store/orders-store";

interface SalesTableProps {
  orders: Order[];
  getStatusLabel: (status: string) => string;
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
    status: string;
    date: string;
    actions: string;
  };
}

export function SalesTable({
  orders,
  getStatusLabel,
  formatDate,
  onViewOrder,
  viewLabel,
  productsLabel,
  noDataLabel,
  headers,
}: SalesTableProps) {
  if (orders.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.orderID}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.customer}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{headers.products}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.total}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.status}</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{headers.date}</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.actions}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="p-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">{noDataLabel}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.orderID}</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.customer}</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">{headers.products}</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.total}</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.status}</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">{headers.date}</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{headers.actions}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
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
                <span className="text-sm text-foreground">
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">{productsLabel.toLowerCase()}</span>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-foreground">{formatPrice(order.total)}</td>
              <td className="px-6 py-4">
                <StatusBadge status={order.status} label={getStatusLabel(order.status)} />
              </td>
              <td className="px-6 py-4 hidden lg:table-cell text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                    title={viewLabel}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}