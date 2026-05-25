"use client";

import { useState, useCallback } from "react";

type DatePreset = "today" | "7d" | "30d";

interface UseDateRangeFilterOptions {
  /** Callback when the filter state changes (e.g. to reset page) */
  onChange?: () => void;
}

/**
 * Shared hook for date range filter management.
 * Used across Orders and Sales admin modules.
 *
 * Provides:
 *   - dateFrom / dateTo: ISO date strings (YYYY-MM-DD)
 *   - activePreset: which quick preset is active
 *   - hasDateFilter: whether any date filter is active
 *   - setDateFrom / setDateTo: setters (clears preset)
 *   - applyPreset: apply a quick preset ("today", "7d", "30d")
 *   - clearDate: reset all date filters
 */
export function useDateRangeFilter(options: UseDateRangeFilterOptions = {}) {
  const { onChange } = options;

  const [dateFrom, setDateFromState] = useState("");
  const [dateTo, setDateToState] = useState("");
  const [activePreset, setActivePreset] = useState<DatePreset | null>(null);

  const hasDateFilter = !!(dateFrom || dateTo);

  const setDateFrom = useCallback(
    (value: string) => {
      setDateFromState(value);
      setActivePreset(null);
      onChange?.();
    },
    [onChange]
  );

  const setDateTo = useCallback(
    (value: string) => {
      setDateToState(value);
      setActivePreset(null);
      onChange?.();
    },
    [onChange]
  );

  const applyPreset = useCallback(
    (preset: DatePreset) => {
      // Toggle off if clicking the same preset
      if (preset === activePreset) {
        clearDate();
        return;
      }

      const now = new Date();
      const today = now.toISOString().split("T")[0];

      setActivePreset(preset);
      setDateToState(today);
      onChange?.();

      if (preset === "today") {
        setDateFromState(today);
      } else if (preset === "7d") {
        const d = new Date(now);
        d.setDate(d.getDate() - 6);
        setDateFromState(d.toISOString().split("T")[0]);
      } else {
        const d = new Date(now);
        d.setDate(d.getDate() - 29);
        setDateFromState(d.toISOString().split("T")[0]);
      }
    },
    [activePreset, onChange]
  );

  const clearDate = useCallback(() => {
    setDateFromState("");
    setDateToState("");
    setActivePreset(null);
    onChange?.();
  }, [onChange]);

  return {
    dateFrom,
    dateTo,
    activePreset,
    hasDateFilter,
    setDateFrom,
    setDateTo,
    applyPreset,
    clearDate,
  } as const;
}
