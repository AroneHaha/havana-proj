"use client";

import { useMemo } from "react";
import type { AdminProduct, FilterStatus } from "./products-types";

export function useProductsFilters(
  products: AdminProduct[],
  searchQuery: string,
  activeFilter: FilterStatus,
  categoryFilter: string
) {
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeFilter !== "all") result = result.filter((p) => p.status === activeFilter);
    if (categoryFilter !== "all") result = result.filter((p) => p.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.nameAr.includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeFilter, categoryFilter, searchQuery]);

  return { filteredProducts };
}