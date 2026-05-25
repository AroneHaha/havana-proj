"use client";

import { useState, useCallback } from "react";

interface UseSearchFilterOptions {
  /** Initial search value */
  initialValue?: string;
  /** Callback when search value changes (after debouncing, etc.) */
  onSearchChange?: (value: string) => void;
}

/**
 * Shared hook for search filter state management.
 * Used across Orders, Products, and Sales admin modules.
 *
 * Provides:
 *   - searchQuery: current search string
 *   - setSearchQuery: setter (also resets to page 1)
 *   - clearSearch: reset to empty string
 */
export function useSearchFilter(options: UseSearchFilterOptions = {}) {
  const { initialValue = "", onSearchChange } = options;

  const [searchQuery, setSearchQueryState] = useState(initialValue);

  const setSearchQuery = useCallback(
    (value: string) => {
      setSearchQueryState(value);
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  const clearSearch = useCallback(() => {
    setSearchQueryState("");
    onSearchChange?.("");
  }, [onSearchChange]);

  return { searchQuery, setSearchQuery, clearSearch } as const;
}
