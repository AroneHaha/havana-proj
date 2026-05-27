"use client";

import { useState, useCallback, useMemo } from "react";

interface UsePaginationOptions {
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  itemsPerPage: number;
  /** Initial page number (1-based) */
  initialPage?: number;
}

/**
 * Shared hook for pagination state management.
 * Used across Orders, Products, and Sales admin modules.
 *
 * Provides:
 *   - currentPage: current 1-based page number
 *   - totalPages: calculated total pages
 *   - setPage: set page directly
 *   - nextPage / prevPage: navigation helpers
 *   - resetPage: jump back to page 1
 *   - paginatedItems: the slice of items for the current page (generic)
 *   - startIndex / endIndex: 0-based indices for the current page
 */
export function usePagination<T>({
  totalItems,
  itemsPerPage,
  initialPage = 1,
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  // Clamp current page if total shrinks
  const safePage = Math.min(currentPage, totalPages);

  const setPage = useCallback(
    (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
    [totalPages]
  );

  const nextPage = useCallback(() => setPage(safePage + 1), [safePage, setPage]);
  const prevPage = useCallback(() => setPage(safePage - 1), [safePage, setPage]);
  const resetPage = useCallback(() => setCurrentPage(1), []);

  const startIndex = (safePage - 1) * itemsPerPage;

  /** Slice any array for the current page.
   *  Uses the items array's own length (not totalItems) so that
   *  paginate works correctly even when totalItems is 0 or stale. */
  const paginate = useCallback(
    <U>(items: U[]): U[] => items.slice(startIndex, startIndex + itemsPerPage),
    [startIndex, itemsPerPage]
  );

  /** End index based on totalItems (for display / metadata only) */
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    currentPage: safePage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    resetPage,
    paginate,
    startIndex,
    endIndex,
  } as const;
}
