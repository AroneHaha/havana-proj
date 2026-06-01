/**
 * useDashboardData — Single-request dashboard initialization hook.
 *
 * Replaces 5+ separate API calls with 1 call to /admin/dashboard/summary.
 * Hydrates all 3 stores (orders, products, reviews) with stats data.
 * Falls back to individual fetches if the summary endpoint fails.
 *
 * Performance:
 *   - Single API call on mount (dashboard summary)
 *   - Stats hydrated into stores for other modules to use
 *   - 5-minute cache — navigating away and back doesn't re-fetch
 *
 * USAGE in dashboard page:
 *   const { loading, error, summary, retry } = useDashboardData();
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useOrdersStore, type OrderStats } from "@/store/orders-store";
import { useProductsStore, type ProductStats } from "@/store/product-store";
import { useReviewsStore, type ReviewStats } from "@/store/review-store";
import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "@/services/dashboard-service";

interface DashboardDataState {
  /** Whether the initial load is in progress */
  loading: boolean;
  /** Error from the summary fetch (non-blocking for stores) */
  error: string | null;
  /** The full dashboard summary data */
  summary: DashboardSummary | null;
  /** Retry the fetch */
  retry: () => void;
}

/** Cache the summary response for 5 minutes (matches page cache TTL) */
let summaryCache: { summary: DashboardSummary; timestamp: number } | null = null;
const SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000;

export function useDashboardData(): DashboardDataState {
  const [loading, setLoading] = useState(!summaryCache);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(
    summaryCache?.summary ?? null
  );

  const hydrateStores = useCallback((data: DashboardSummary) => {
    // Hydrate stats into all 3 stores without triggering API calls.
    useOrdersStore.getState().hydrateStatsFromSummary(data.orders.stats as OrderStats);
    useProductsStore.getState().hydrateStatsFromSummary(data.products.stats as ProductStats);
    useReviewsStore.getState().hydrateStatsFromSummary(data.reviews.stats as ReviewStats);
  }, []);

  const fetchSummary = useCallback(async () => {
    // ── Check cache first ──
    if (summaryCache && Date.now() - summaryCache.timestamp < SUMMARY_CACHE_TTL_MS) {
      setSummary(summaryCache.summary);
      hydrateStores(summaryCache.summary);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchDashboardSummary();

      setSummary(data);
      hydrateStores(data);

      // Cache the result
      summaryCache = { summary: data, timestamp: Date.now() };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard";

      setError(message);

      // Fallback: try individual store fetches as backup
      await Promise.allSettled([
        useOrdersStore.getState().fetchStats(),
        useProductsStore.getState().fetchStats(),
        useReviewsStore.getState().fetchStats(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [hydrateStores]);

  useEffect(() => {
    fetchSummary();
    // NOTE: No cleanup abort here — aborting on unmount causes the
    // dashboard to get stuck loading in React StrictMode (dev mode).
    // The 5-min cache TTL prevents redundant fetches on remount.
  }, [fetchSummary]);

  return {
    loading,
    error,
    summary,
    retry: () => {
      summaryCache = null;
      fetchSummary();
    },
  };
}

/**
 * Invalidate the dashboard summary cache.
 * Call this after any CRUD operation that changes dashboard data
 * (e.g., order status change, product update, review visibility change).
 */
export function invalidateDashboardCache() {
  summaryCache = null;
}
