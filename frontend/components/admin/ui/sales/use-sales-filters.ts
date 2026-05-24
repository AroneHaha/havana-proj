"use client";

import { useMemo } from "react";
import type { Order } from "@/store/orders-store";

export interface SalesFilterState {
  searchQuery: string;
  productFilter: string; // "all" or productId
  month: number; // 1-12
  year: number;
  dateFrom: string; // custom date range
  dateTo: string;
  activeDatePreset: "today" | "7d" | "30d" | null;
}

export interface SalesStats {
  totalOrders: number;    // orders matching all filters
  totalRevenue: number;   // revenue from matched orders
  productsSold: number;   // total item qty from matched orders
}

/**
 * Get available years for the year dropdown.
 * Rules:
 *   - Always include the current year
 *   - Include previous years only if they have order records
 *   - Never include future years
 */
export function getAvailableYears(orders: Order[]): number[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const years = new Set<number>();

  // Always include current year
  years.add(currentYear);

  // Add years from data (only past/current)
  for (const o of orders) {
    const d = new Date(o.createdAt);
    const y = d.getFullYear();
    if (y <= currentYear) {
      years.add(y);
    }
  }

  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Get months for a specific year — calendar-based, NOT data-based.
 * Rules:
 *   - For current year: show January through current month (no future months)
 *   - For past years: show all 12 months (January through December)
 *   - This is independent of whether data exists for those months
 */
export function getCalendarMonthsForYear(year: number): number[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  if (year === currentYear) {
    // Current year: January → current month
    const currentMonth = now.getMonth() + 1; // 1-12
    return Array.from({ length: currentMonth }, (_, i) => i + 1);
  }

  // Past year: all 12 months
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}

/** Get unique product options from orders. */
export function getProductOptions(orders: Order[]): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const o of orders) {
    for (const item of o.items) {
      if (!seen.has(item.productId)) {
        seen.set(item.productId, item.productName);
      }
    }
  }
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}

export function useSalesFilters(
  salesOrders: Order[],
  filters: SalesFilterState,
  itemsPerPage: number,
  currentPage: number
) {
  // Apply ALL filters to get the filtered set
  const filteredSales = useMemo(() => {
    let result = [...salesOrders];

    // 1. Year filter (applies even without month)
    if (filters.year) {
      result = result.filter((o) => new Date(o.createdAt).getFullYear() === filters.year);
    }

    // 2. Month filter (requires year already applied above)
    if (filters.month && filters.year) {
      result = result.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() + 1 === filters.month;
      });
    }

    // 3. Custom date range (overrides month/year when preset is active or custom dates set)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.createdAt) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.createdAt) <= to);
    }

    // 4. Product filter
    if (filters.productFilter && filters.productFilter !== "all") {
      result = result.filter((o) =>
        o.items.some((item) => item.productId === filters.productFilter)
      );
    }

    // 5. Search filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [salesOrders, filters]);

  // Compute stats from the SAME filtered set — shared logic
  const stats: SalesStats = useMemo(() => {
    const totalOrders = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, o) => sum + o.total, 0);
    const productsSold = filteredSales.reduce(
      (sum, o) =>
        sum +
        o.items.reduce((itemSum, i) => {
          // If product filter is active, only count that product's qty
          if (filters.productFilter && filters.productFilter !== "all") {
            return itemSum + (i.productId === filters.productFilter ? i.quantity : 0);
          }
          return itemSum + i.quantity;
        }, 0),
      0
    );
    return { totalOrders, totalRevenue, productsSold };
  }, [filteredSales, filters.productFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / itemsPerPage));
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Available filter options derived from the raw data
  const availableYears = useMemo(() => getAvailableYears(salesOrders), [salesOrders]);
  const productOptions = useMemo(() => getProductOptions(salesOrders), [salesOrders]);

  return { filteredSales, paginatedSales, totalPages, stats, availableYears, productOptions };
}
