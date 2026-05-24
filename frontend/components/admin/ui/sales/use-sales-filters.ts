"use client";

import { useMemo } from "react";
import type { Order } from "@/store/orders-store";

export function useSalesFilters(
  salesOrders: Order[],
  searchQuery: string,
  dateFrom: string,
  dateTo: string,
  itemsPerPage: number,
  currentPage: number
) {
  const filteredSales = useMemo(() => {
    let result = [...salesOrders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.createdAt) <= to);
    }

    return result;
  }, [salesOrders, searchQuery, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / itemsPerPage));
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return { filteredSales, paginatedSales, totalPages };
}
