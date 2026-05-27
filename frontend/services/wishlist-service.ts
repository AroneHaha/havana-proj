/**
 * Wishlist Service — production-ready for Laravel API.
 *
 * Architecture:
 *   1. All HTTP calls go through `createServiceFetch(WishlistError, {...})` which
 *      attaches the JWT Authorization header and handles token refresh.
 *   2. When `NEXT_PUBLIC_API_URL` is not set (dev without backend),
 *      everything falls back to mock data — zero config needed.
 *   3. Error handling uses typed `WishlistError` extending `AppError` for the UI.
 *
 * Expected Laravel endpoints (Sanctum-protected):
 *   GET    /wishlist           → user's wishlist (returns product IDs)
 *   POST   /wishlist/items     → add item { product_id }
 *   DELETE /wishlist/items/:id → remove item
 */

import { API_BASE, type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";

// ─── Types ────────────────────────────────────────────────────────────

export type { FieldErrors };

// ─── Error class ──────────────────────────────────────────────────────

export class WishlistError extends AppError {
  declare code:
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "TOKEN_EXPIRED"
    | "NETWORK_ERROR"
    | "UNKNOWN";

  constructor(
    message: string,
    code: WishlistError["code"],
    fields: FieldErrors = {}
  ) {
    super(message, code, fields);
    this.name = "WishlistError";
  }
}

// ─── Laravel API response shapes ──────────────────────────────────────

interface LaravelWishlistItem {
  id: string;
  product_id: string;
}

interface LaravelWishlistResponse {
  data: LaravelWishlistItem[];
}

// ─── Auth-aware fetch for wishlist ────────────────────────────────────

const wishlistFetch = createServiceFetch(WishlistError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

// ─── Mock data ────────────────────────────────────────────────────────

// Wishlist starts empty — mock just returns empty array.

let MOCK_WISHLIST_ITEMS: string[] = []; // product IDs

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Fetch user's wishlist.
 * When API is live, this hits GET /wishlist.
 * Otherwise returns mock wishlist (starts empty).
 */
export async function fetchWishlist(): Promise<string[]> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await wishlistFetch<LaravelWishlistResponse>("/wishlist");
      return data.data.map((item) => String(item.product_id));
    } catch (err) {
      if (err instanceof WishlistError && err.code === "FORBIDDEN") throw err;
      // API unreachable — fall through to mock
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 150));
  return [...MOCK_WISHLIST_ITEMS];
}

/**
 * Add item to wishlist.
 * When API is live, this hits POST /wishlist/items { product_id }.
 * Otherwise simulates adding to mock wishlist.
 */
export async function addWishlistItem(productId: string): Promise<boolean> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      await wishlistFetch<{ message: string }>("/wishlist/items", {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });
      return true;
    } catch (err) {
      if (err instanceof WishlistError) throw err;
      // fall through to mock
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 150));

  if (!MOCK_WISHLIST_ITEMS.includes(productId)) {
    MOCK_WISHLIST_ITEMS.push(productId);
  }
  return true;
}

/**
 * Remove item from wishlist.
 * When API is live, this hits DELETE /wishlist/items/:id.
 * Otherwise simulates removing from mock wishlist.
 */
export async function removeWishlistItem(productId: string): Promise<boolean> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      await wishlistFetch<{ message: string }>(`/wishlist/items/${productId}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      if (err instanceof WishlistError) throw err;
      // fall through to mock
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 150));

  const idx = MOCK_WISHLIST_ITEMS.indexOf(productId);
  if (idx === -1) {
    throw new WishlistError("Wishlist item not found", "NOT_FOUND");
  }
  MOCK_WISHLIST_ITEMS.splice(idx, 1);
  return true;
}