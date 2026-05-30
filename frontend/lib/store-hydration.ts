/**
 * Store Hydration — rehydrate all Zustand persisted stores on app mount.
 *
 * All stores use `skipHydration: true` to avoid SSR/hydration mismatches.
 * This module provides a single function to rehydrate them all at once,
 * so cached data from localStorage is available BEFORE any fetch call.
 *
 * This enables the Stale-While-Revalidate pattern:
 *   1. App loads → hydrate stores from localStorage → instant stale data
 *   2. Component mounts → fetchX() sees data exists → skips loading spinner
 *   3. fetchX() completes → store updates silently with fresh data
 */

import { useOrdersStore } from "@/store/orders-store";
import { useProductsStore } from "@/store/product-store";
import { useReviewsStore } from "@/store/review-store";

/**
 * Rehydrate all persisted stores from localStorage.
 * Call once on app mount (in the admin layout or root layout).
 * Returns a promise that resolves when all stores are hydrated.
 */
export async function hydrateAllStores(): Promise<void> {
  const hydrations: Promise<void>[] = [];

  // Each store's persist API provides a rehydrate() method
  // that reads from localStorage and updates the store state.
  if (useOrdersStore.persist.rehydrate) {
    hydrations.push(
      new Promise<void>((resolve) => {
        useOrdersStore.persist.rehydrate();
        resolve();
      })
    );
  }

  if (useProductsStore.persist.rehydrate) {
    hydrations.push(
      new Promise<void>((resolve) => {
        useProductsStore.persist.rehydrate();
        resolve();
      })
    );
  }

  if (useReviewsStore.persist.rehydrate) {
    hydrations.push(
      new Promise<void>((resolve) => {
        useReviewsStore.persist.rehydrate();
        resolve();
      })
    );
  }

  await Promise.all(hydrations);
}

/**
 * Map of sidebar routes → store prefetch actions.
 * Used by the admin sidebar for hover prefetching.
 */
export async function prefetchRoute(path: string): Promise<void> {
  switch (path) {
    case "/dashboard":
      // Dashboard uses all stores — prefetch everything
      await Promise.allSettled([
        useOrdersStore.getState().fetchOrders(),
        useOrdersStore.getState().fetchStats(),
        useProductsStore.getState().fetchProducts(),
        useProductsStore.getState().fetchStats(),
        useReviewsStore.getState().fetchReviews(),
        useReviewsStore.getState().fetchStats(),
      ]);
      break;

    case "/orders":
      await Promise.allSettled([
        useOrdersStore.getState().fetchOrders(),
        useOrdersStore.getState().fetchStats(),
      ]);
      break;

    case "/products":
      await Promise.allSettled([
        useProductsStore.getState().fetchProducts(),
        useProductsStore.getState().fetchStats(),
      ]);
      break;

    case "/sales-reviews":
      await Promise.allSettled([
        useReviewsStore.getState().fetchReviews(),
        useReviewsStore.getState().fetchStats(),
      ]);
      break;
  }
}
