/**
 * useDashboardData — Single-request dashboard initialization hook.
 *
 * Replaces 5+ separate API calls with 1 call to /admin/dashboard/summary.
 * Hydrates all 3 stores (orders, products, reviews) with stats data.
 * Falls back to individual fetches if the summary endpoint fails.
 *
 * USAGE in dashboard page:
 *   const { loading, error, summary, retry } = useDashboardData();
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useOrdersStore, type OrderStats } from "@/store/orders-store";
import { useProductsStore, type ProductStats } from "@/store/product-store";
import { useReviewsStore, type ReviewStats } from "@/store/review-store";
import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "@/services/dashboard-service";
import { API_BASE } from "@/lib/api-config";

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

// Track whether we've already fetched on this session to avoid
// re-fetching when the component remounts (React StrictMode, navigation)
let sessionFetched = false;

export function useDashboardData(): DashboardDataState {
  const [loading, setLoading] = useState(!sessionFetched);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const mountRef = useRef(false);

  const hydrateStores = useCallback((data: DashboardSummary) => {
    // Hydrate stats into all 3 stores without triggering API calls.
    // Types match exactly: Dashboard*Stats fields are all `number`.
    useOrdersStore.getState().hydrateStatsFromSummary(data.orders.stats as OrderStats);
    useProductsStore.getState().hydrateStatsFromSummary(data.products.stats as ProductStats);
    useReviewsStore.getState().hydrateStatsFromSummary(data.reviews.stats as ReviewStats);
  }, []);

  const fetchSummary = useCallback(async () => {
    if (!API_BASE) {
      // No API configured — fall back to individual store fetches (mock mode)
      setLoading(true);
      try {
        await Promise.allSettled([
          useOrdersStore.getState().fetchOrders(),
          useOrdersStore.getState().fetchStats(),
          useProductsStore.getState().fetchProducts(),
          useProductsStore.getState().fetchStats(),
          useReviewsStore.getState().fetchReviews(),
          useReviewsStore.getState().fetchStats(),
        ]);
      } catch {
        // Individual stores handle their own errors
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
      hydrateStores(data);
      sessionFetched = true;
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
    if (mountRef.current) return; // StrictMode guard
    mountRef.current = true;

    if (sessionFetched) {
      // Already fetched in this session — don't re-fetch
      setLoading(false);
      return;
    }

    fetchSummary();
  }, [fetchSummary]);

  return {
    loading,
    error,
    summary,
    retry: () => {
      sessionFetched = false;
      fetchSummary();
    },
  };
}
