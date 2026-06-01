/**
 * Cart Store — Zustand + persist, API-first.
 *
 * Architecture:
 *   1. All cart mutations go through the cart-service layer.
 *      When NEXT_PUBLIC_API_URL is set AND user is authenticated → hits Laravel API.
 *      When not set / unauthenticated → uses localStorage cache as fallback.
 *   2. The store interface stays the same regardless of data source.
 *      Components never import the service directly.
 *   3. `CartItem` still embeds a full `Product` object for component convenience
 *      (cart-drawer, header badge count, etc.). The service returns `CartItemAPI`
 *      with flat fields, which gets mapped back to `CartItem` with a minimal Product.
 *   4. Persisted to localStorage under "havana-cart" key as a cache.
 *      On mount, `fetchCart()` tries the API first, then falls back to the cache.
 *   5. Guest users: cart works purely in localStorage. When they log in,
 *      `fetchCart()` syncs the server cart, and future mutations hit the API.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchCart as serviceFetchCart,
  addCartItem as serviceAddCartItem,
  updateCartItemQuantity as serviceUpdateQuantity,
  removeCartItem as serviceRemoveCartItem,
  clearCart as serviceClearCart,
  type CartItemAPI,
  type CartError,
} from "@/services/cart-service";
import { isAuthenticated } from "@/services/auth-service";
import type { CartItem, Product } from "@/types";
import { getErrorMessage } from "@/lib/get-error-message";

// Re-export CartError so components can catch it
export type { CartError };

// ─── Mapping helpers ───────────────────────────────────────────────────

/**
 * Convert a CartItemAPI (flat, from service) back to CartItem (with embedded Product).
 * The Product is minimal — just enough for the cart-drawer to render.
 */
function cartItemAPIToCartItem(api: CartItemAPI): CartItem {
  const product: Product = {
    id: api.productId,
    slug: "",
    name: api.productName,
    description: "",
    localeText: {},
    price: api.price,
    salePrice: api.salePrice ?? undefined,
    image: api.productImage,
    images: [],
    category: "",
    stock: 0,
    rating: 0,
    reviewCount: 0,
    inStock: api.price > 0, // Derive from available data; real value comes from API
  };
  return { product, quantity: api.quantity };
}

// ─── Store interface ──────────────────────────────────────────────────

interface CartStore {
  items: CartItem[];
  /** Maps productId → server-side cart item ID (for PATCH/DELETE calls) */
  cartItemIds: Record<string, string>;
  loading: boolean;
  error: string | null;

  // ─── Lifecycle ─────────────────────────────────────────────────────
  /** Fetch cart from API. Call on mount. */
  fetchCart: () => Promise<void>;

  // ─── Actions ────────────────────────────────────────────────────────
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // ─── Derived helpers (methods to avoid re-renders) ──────────────────
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartItemIds: {},
      loading: false,
      error: null,

      fetchCart: async () => {
        // Only fetch from API if user is authenticated
        // Guest users rely purely on localStorage cache
        if (!isAuthenticated()) return;

        set({ loading: true });
        try {
          const apiItems = await serviceFetchCart();
          const items = apiItems.map(cartItemAPIToCartItem);
          // Build the productId → cartItemId mapping from the API response
          const cartItemIds: Record<string, string> = {};
          apiItems.forEach((api) => {
            cartItemIds[api.productId] = api.id;
          });
          set({ items, cartItemIds, loading: false });
        } catch (err) {
          // API failed — keep the localStorage cache as-is
          set({ loading: false, error: getErrorMessage(err, "Failed to fetch cart") });
        }
      },

      addItem: async (product: Product) => {
        const existing = get().items.find((item) => item.product.id === product.id);

        // ── Optimistic local update (instant UI) ──
        if (existing) {
          set((state) => ({
            items: state.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { product, quantity: 1 }],
          }));
        }

        // ── Try API if authenticated ──
        if (isAuthenticated()) {
          try {
            const apiItem = await serviceAddCartItem(product.id, 1);
            // Store the server-side cart item ID for future PATCH/DELETE
            set((state) => ({
              cartItemIds: { ...state.cartItemIds, [product.id]: apiItem.id },
            }));
          } catch (err) {
            // Revert optimistic update on failure
            set((state) => ({
              items: state.items.filter((item) =>
                existing ? true : item.product.id !== product.id
              ).map((item) =>
                existing && item.product.id === product.id
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              ),
              error: getErrorMessage(err, "Failed to add item"),
            }));
          }
        }
      },

      removeItem: async (productId: string) => {
        // ── Optimistic local remove ──
        const removed = get().items.find((item) => item.product.id === productId);
        // Save cartItemId BEFORE the optimistic update clears it
        const cartItemId = get().cartItemIds[productId] ?? productId;

        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
          cartItemIds: Object.fromEntries(
            Object.entries(state.cartItemIds).filter(([pid]) => pid !== productId)
          ),
        }));

        // ── Try API if authenticated ──
        if (isAuthenticated() && removed) {
          try {
            await serviceRemoveCartItem(cartItemId);
            // cartItemId already cleaned up in optimistic update
          } catch (err) {
            // Revert on failure — restore both items AND cartItemId mapping
            set((state) => ({
              items: [...state.items, removed],
              cartItemIds: { ...state.cartItemIds, [productId]: cartItemId },
              error: getErrorMessage(err, "Failed to remove item"),
            }));
          }
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const existing = get().items.find((item) => item.product.id === productId);
        if (!existing) return;

        const prevQuantity = existing.quantity;

        // ── Optimistic local update ──
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));

        // ── Try API if authenticated ──
        if (isAuthenticated()) {
          const cartItemId = get().cartItemIds[productId] ?? productId;
          try {
            await serviceUpdateQuantity(cartItemId, quantity);
          } catch (err) {
            // Revert on failure
            set((state) => ({
              items: state.items.map((item) =>
                item.product.id === productId
                  ? { ...item, quantity: prevQuantity }
                  : item
              ),
              error: getErrorMessage(err, "Failed to update quantity"),
            }));
          }
        }
      },

      clearCart: async () => {
        const prev = get().items;
        const prevCartItemIds = get().cartItemIds;

        // ── Optimistic clear ──
        set({ items: [], cartItemIds: {} });

        // ── Try API if authenticated ──
        if (isAuthenticated()) {
          try {
            await serviceClearCart();
          } catch (err) {
            // DO NOT revert the cart clear on API failure after an order was placed.
            // Restoring items would make the user think the order didn't go through,
            // potentially leading them to place a duplicate order.
            // Instead, just set an error message — the cart stays empty.
            set({ error: getErrorMessage(err, "Failed to clear cart on server") });
          }
        }
      },

      // ─── Derived helpers ──────────────────────────────────────────────

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity,
          0
        ),
    }),
    {
      name: "havana-cart",
      // Only persist items as cache — loading/error are transient
      partialize: (state) => ({ items: state.items, cartItemIds: state.cartItemIds }),
      skipHydration: true,
    }
  )
);
