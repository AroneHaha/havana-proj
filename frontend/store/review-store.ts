/** frontend/store/review-store.ts **/
/**
 * Reviews Store — Zustand + persist.
 *
 * Architecture:
 *   1. All review data flows through the review-service layer.
 *      When NEXT_PUBLIC_API_URL is set → hits Laravel API.
 *      When not set → uses mock data with simulated latency.
 *   2. The store interface stays the same regardless of data source.
 *      Components never import the service directly.
 *   3. Stats (average rating, distribution) are fetched from the service,
 *      not computed client-side — so when the backend goes live the
 *      numbers are authoritative.
 *   4. Persisted to localStorage under "havana-reviews" key as a cache.
 *      The store refreshes from the API on mount.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchReviews as serviceFetchReviews,
  updateReviewVisibility as serviceUpdateVisibility,
  deleteReview as serviceDeleteReview,
  fetchReviewStats as serviceFetchStats,
  type ReviewsError,
} from "@/services/review-service";
import type {
  Review,
  ReviewStats,
  ReviewVisibility,
  ReviewFilters,
} from "@/types/review";
import { getErrorMessage } from "@/lib/get-error-message";

// Re-export types so components can import from the store
export type { Review, ReviewVisibility, ReviewFilters, ReviewStats };
export type { ReviewsError };

interface ReviewsState {
  reviews: Review[];
  stats: ReviewStats | null;
  filters: ReviewFilters;
  loading: boolean;
  error: string | null;

  // ─── Lifecycle ─────────────────────────────────────────────────────
  fetchReviews: (filters?: ReviewFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: Partial<ReviewFilters>) => void;
  resetFilters: () => void;

  // ─── Actions ────────────────────────────────────────────────────────
  updateVisibility: (id: string, visibility: ReviewVisibility) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // ─── Derived helpers (methods to avoid re-renders) ──────────────────
  getReviewById: (id: string) => Review | undefined;
  getReviewsByProduct: (productId: string) => Review[];
  getAverageRating: () => number;
}

const DEFAULT_FILTERS: ReviewFilters = {};

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],
      stats: null,
      filters: { ...DEFAULT_FILTERS },
      loading: false,
      error: null,

      fetchReviews: async (filters?: ReviewFilters) => {
        set({ loading: true, error: null });
        try {
          const activeFilters = filters ?? get().filters;
          const result = await serviceFetchReviews(activeFilters);
          set({ reviews: result.reviews, loading: false });
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to fetch reviews"), loading: false });
        }
      },

      fetchStats: async () => {
        try {
          const stats = await serviceFetchStats();
          set({ stats });
        } catch {
          // Stats are non-critical
        }
      },

      setFilters: (partial) => {
        set((state) => ({
          filters: { ...state.filters, ...partial },
        }));
      },

      resetFilters: () => {
        set({ filters: { ...DEFAULT_FILTERS } });
      },

      updateVisibility: async (id, visibility) => {
        try {
          const updated = await serviceUpdateVisibility(id, visibility);
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === id ? updated : r
            ),
          }));
          get().fetchStats();
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to update review visibility") });
          throw err;
        }
      },

      deleteReview: async (id) => {
        try {
          await serviceDeleteReview(id);
          set((state) => ({
            reviews: state.reviews.filter((r) => r.id !== id),
          }));
          get().fetchStats();
        } catch (err) {
          set({ error: getErrorMessage(err, "Failed to delete review") });
          throw err;
        }
      },

      // ─── Derived helpers ────────────────────────────────────────────

      getReviewById: (id) => get().reviews.find((r) => r.id === id),

      getReviewsByProduct: (productId) =>
        get().reviews.filter((r) => r.product.productId === productId),

      getAverageRating: () => {
        const { stats } = get();
        if (stats) return stats.averageRating;
        const visible = get().reviews.filter((r) => r.visibility === "visible");
        if (visible.length === 0) return 0;
        return visible.reduce((sum, r) => sum + r.rating, 0) / visible.length;
      },
    }),
    {
      name: "havana-reviews",
      partialize: (state) => ({ reviews: state.reviews }),
      skipHydration: true,
    }
  )
);