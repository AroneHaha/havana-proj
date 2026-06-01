/**
 * Cart Service — production-ready for Laravel API.
 *
 * Architecture:
 *   1. All HTTP calls go through `createServiceFetch(CartError, {...})` which
 *      attaches the JWT Authorization header and handles token refresh.
 *   2. Laravel API responses (snake_case) are mapped to our canonical
 *      `CartItemAPI` type (camelCase).
 *   3. Error handling uses typed `CartError` extending `AppError` for the UI.
 *
 * Expected Laravel endpoints (Sanctum-protected):
 *   GET    /cart              → user's cart
 *   POST   /cart/items        → add item { product_id, quantity }
 *   PATCH  /cart/items/:id    → update quantity { quantity }
 *   DELETE /cart/items/:id    → remove item
 *   DELETE /cart              → clear cart
 */

import { type FieldErrors } from "@/lib/api-config";
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

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Fetch user's cart.
 */
export async function fetchCart(): Promise<CartItemAPI[]> {
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

/**
 * Add item to cart.
 */
export async function addCartItem(
  productId: string,
  quantity: number
): Promise<CartItemAPI> {
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

/**
 * Update cart item quantity.
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartItemAPI> {
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

/**
 * Remove item from cart.
 */
export async function removeCartItem(cartItemId: string): Promise<boolean> {
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

/**
 * Clear entire cart.
 */
export async function clearCart(): Promise<boolean> {
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
