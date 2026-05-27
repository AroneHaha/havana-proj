/**
 * Wishlist Store — Zustand + persist, API-first.
 *
 * Architecture:
 *   1. All wishlist mutations go through the wishlist-service layer.
 *      When NEXT_PUBLIC_API_URL is set AND user is authenticated → hits Laravel API.
 *      When not set / unauthenticated → uses mock fallback (localStorage cache).
 *   2. The store interface stays the same regardless of data source.
 *      Components never import the service directly.
 *   3. `items` stores full `Product` objects for component convenience
 *      (product cards, header badge count, etc.).
 *   4. `wishlistItemIds` maps productId → wishlistItemId so that
 *      DELETE /wishlist/items/:id sends the correct pivot row ID.
 *   5. Persisted to localStorage under "havana-wishlist" key as a cache.
 *      On mount, `fetchWishlist()` tries the API first, then falls back to the cache.
 *   6. Guest users: wishlist works purely in localStorage. When they log in,
 *      `fetchWishlist()` syncs from the server, and future mutations hit the API.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchWishlist as serviceFetchWishlist,
  addWishlistItem as serviceAddItem,
  removeWishlistItem as serviceRemoveItem,
  type WishlistError,
  type WishlistItem,
} from "@/services/wishlist-service";
import { isAuthenticated } from "@/services/auth-service";
import type { Product } from "@/types";
import { getErrorMessage } from "@/lib/get-error-message";

// Re-export WishlistError so components can catch it
export type { WishlistError };

// ─── Store interface ──────────────────────────────────────────────────

interface WishlistStore {
  items: Product[];
  /** Map: productId → wishlistItemId (pivot row ID for DELETE) */
  wishlistItemIds: Record<string, string>;
  loading: boolean;
  error: string | null;

  // ─── Lifecycle ─────────────────────────────────────────────────────
  /** Fetch wishlist from service (API or mock). Call on mount. */
  fetchWishlist: () => Promise<void>;

  // ─── Actions ────────────────────────────────────────────────────────
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (product: Product) => Promise<void>;

  // ─── Derived helpers (methods to avoid re-renders) ──────────────────
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistItemIds: {},
      loading: false,
      error: null,

      fetchWishlist: async () => {
        // Only fetch from API if user is authenticated
        // Guest users rely purely on localStorage cache
        if (!isAuthenticated()) return;

        set({ loading: true });
        try {
          const wishlistItems: WishlistItem[] = await serviceFetchWishlist();

          // Build the wishlistItemId mapping
          const idMap: Record<string, string> = {};
          wishlistItems.forEach((wi) => {
            idMap[wi.productId] = wi.wishlistItemId;
          });

          // The API returns only product IDs. We keep existing Product
          // objects from cache and add/remove to match the server list.
          // Products not in cache are represented as minimal stubs.
          const cachedItems = get().items;
          const merged: Product[] = wishlistItems.map((wi) => {
            const cached = cachedItems.find((p) => p.id === wi.productId);
            if (cached) return cached;
            // Stub product — will be populated when product data is loaded
            return {
              id: wi.productId,
              slug: "",
              name: `Product ${wi.productId}`,
              description: "",
              localeText: {},
              price: 0,
              image: "",
              images: [],
              category: "",
              stock: 0,
              rating: 0,
              reviewCount: 0,
              inStock: false, // Stub — real value comes from product API
            } as Product;
          });

          set({ items: merged, wishlistItemIds: idMap, loading: false });
        } catch (err) {
          set({ loading: false, error: getErrorMessage(err, "Failed to fetch wishlist") });
        }
      },

      addItem: async (product: Product) => {
        // Skip if already in wishlist
        if (get().items.some((item) => item.id === product.id)) return;

        // ── Optimistic local add ──
        set((state) => ({ items: [...state.items, product] }));

        // ── Try API if authenticated ──
        if (isAuthenticated()) {
          try {
            await serviceAddItem(product.id);
            // Re-fetch to get the server-assigned wishlistItemId
            get().fetchWishlist();
          } catch (err) {
            // Revert on failure
            set((state) => ({
              items: state.items.filter((item) => item.id !== product.id),
              error: getErrorMessage(err, "Failed to add to wishlist"),
            }));
          }
        }
      },

      removeItem: async (productId: string) => {
        const removed = get().items.find((item) => item.id === productId);
        const wishlistItemId = get().wishlistItemIds[productId];

        // ── Optimistic local remove ──
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
          wishlistItemIds: Object.fromEntries(
            Object.entries(state.wishlistItemIds).filter(([pid]) => pid !== productId)
          ),
        }));

        // ── Try API if authenticated ──
        if (isAuthenticated() && wishlistItemId) {
          try {
            // Use the wishlist pivot row ID, not the product ID
            await serviceRemoveItem(wishlistItemId);
          } catch (err) {
            // Revert on failure
            set((state) => ({
              items: removed ? [...state.items, removed] : state.items,
              wishlistItemIds: { ...state.wishlistItemIds, [productId]: wishlistItemId },
              error: getErrorMessage(err, "Failed to remove from wishlist"),
            }));
          }
        }
      },

      toggleItem: async (product: Product) => {
        const isIn = get().isInWishlist(product.id);
        if (isIn) {
          await get().removeItem(product.id);
        } else {
          await get().addItem(product);
        }
      },

      // ─── Derived helpers ──────────────────────────────────────────────

      isInWishlist: (productId: string) =>
        get().items.some((item) => item.id === productId),

      getItemCount: () => get().items.length,
    }),
    {
      name: "havana-wishlist",
      // Only persist items as cache — loading/error are transient
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    }
  )
);
