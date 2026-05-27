/**
 * Cart Service — production-ready for Laravel API.
 *
 * Architecture:
 *   1. All HTTP calls go through `createServiceFetch(CartError, {...})` which
 *      attaches the JWT Authorization header and handles token refresh.
 *   2. Laravel API responses (snake_case) are mapped to our canonical
 *      `CartItemAPI` type (camelCase).
 *   3. When `NEXT_PUBLIC_API_URL` is not set (dev without backend),
 *      everything falls back to mock data — zero config needed.
 *   4. Error handling uses typed `CartError` extending `AppError` for the UI.
 *
 * Expected Laravel endpoints (Sanctum-protected):
 *   GET    /cart              → user's cart
 *   POST   /cart/items        → add item { product_id, quantity }
 *   PATCH  /cart/items/:id    → update quantity { quantity }
 *   DELETE /cart/items/:id    → remove item
 *   DELETE /cart              → clear cart
 */

import { API_BASE, type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";

// ─── Types ────────────────────────────────────────────────────────────

export interface CartItemAPI {
  id: string;            // cart item ID from backend
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  salePrice: number | null;
  quantity: number;
}

export type { FieldErrors };

// ─── Error class ──────────────────────────────────────────────────────

export class CartError extends AppError {
  declare code:
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "TOKEN_EXPIRED"
    | "NETWORK_ERROR"
    | "STOCK_INSUFFICIENT"
    | "UNKNOWN";

  constructor(
    message: string,
    code: CartError["code"],
    fields: FieldErrors = {}
  ) {
    super(message, code, fields);
    this.name = "CartError";
  }
}

// ─── Laravel API response shapes ──────────────────────────────────────

interface LaravelCartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  sale_price: number | null;
  quantity: number;
}

interface LaravelCartResponse {
  data: LaravelCartItem[];
}

// ─── Map Laravel cart item → CartItemAPI ───────────────────────────────

function mapLaravelCartItem(raw: LaravelCartItem): CartItemAPI {
  return {
    id: raw.id,
    productId: String(raw.product_id),
    productName: raw.product_name,
    productImage: raw.product_image,
    price: raw.price,
    salePrice: raw.sale_price,
    quantity: raw.quantity,
  };
}

// ─── Auth-aware fetch for cart (reuses auth-service) ──────────────────

const cartFetch = createServiceFetch(CartError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

// ─── Mock data ────────────────────────────────────────────────────────

// Cart starts empty — mock just returns empty array.
// The mock add/remove/update simulate with delays.

let MOCK_CART_ITEMS: CartItemAPI[] = [];

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Fetch user's cart.
 * When API is live, this hits GET /cart.
 * Otherwise returns mock cart (starts empty).
 */
export async function fetchCart(): Promise<CartItemAPI[]> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await cartFetch<LaravelCartResponse>("/cart");
      return data.data.map(mapLaravelCartItem);
    } catch (err) {
      if (err instanceof CartError && err.code === "FORBIDDEN") throw err;
      if (err instanceof CartError) throw err;
      throw new CartError(
        err instanceof Error ? err.message : "Failed to fetch cart",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 150));
  return [...MOCK_CART_ITEMS];
}

/**
 * Add item to cart.
 * When API is live, this hits POST /cart/items { product_id, quantity }.
 * Otherwise simulates adding to mock cart.
 */
export async function addCartItem(
  productId: string,
  quantity: number
): Promise<CartItemAPI> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await cartFetch<{ data: LaravelCartItem }>("/cart/items", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      return mapLaravelCartItem(data.data);
    } catch (err) {
      if (err instanceof CartError) throw err;
      throw new CartError(
        err instanceof Error ? err.message : "Failed to add cart item",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 200));

  const existing = MOCK_CART_ITEMS.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    return { ...existing };
  }

  const newItem: CartItemAPI = {
    id: `cart-item-${Date.now()}`,
    productId,
    productName: `Product ${productId}`,
    productImage: "",
    price: 0,
    salePrice: null,
    quantity,
  };
  MOCK_CART_ITEMS.push(newItem);
  return { ...newItem };
}

/**
 * Update cart item quantity.
 * When API is live, this hits PATCH /cart/items/:id { quantity }.
 * Otherwise simulates updating mock cart.
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartItemAPI> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await cartFetch<{ data: LaravelCartItem }>(
        `/cart/items/${cartItemId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ quantity }),
        }
      );
      return mapLaravelCartItem(data.data);
    } catch (err) {
      if (err instanceof CartError) throw err;
      throw new CartError(
        err instanceof Error ? err.message : "Failed to update cart item",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 150));

  const item = MOCK_CART_ITEMS.find((i) => i.id === cartItemId);
  if (!item) {
    throw new CartError("Cart item not found", "NOT_FOUND");
  }
  item.quantity = quantity;
  return { ...item };
}

/**
 * Remove item from cart.
 * When API is live, this hits DELETE /cart/items/:id.
 * Otherwise simulates removing from mock cart.
 */
export async function removeCartItem(cartItemId: string): Promise<boolean> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      await cartFetch<{ message: string }>(`/cart/items/${cartItemId}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      if (err instanceof CartError) throw err;
      throw new CartError(
        err instanceof Error ? err.message : "Failed to remove cart item",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 150));

  const idx = MOCK_CART_ITEMS.findIndex((i) => i.id === cartItemId);
  if (idx === -1) {
    throw new CartError("Cart item not found", "NOT_FOUND");
  }
  MOCK_CART_ITEMS.splice(idx, 1);
  return true;
}

/**
 * Clear entire cart.
 * When API is live, this hits DELETE /cart.
 * Otherwise clears mock cart.
 */
export async function clearCart(): Promise<boolean> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      await cartFetch<{ message: string }>("/cart", {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      if (err instanceof CartError) throw err;
      throw new CartError(
        err instanceof Error ? err.message : "Failed to clear cart",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 100));
  MOCK_CART_ITEMS = [];
  return true;
}