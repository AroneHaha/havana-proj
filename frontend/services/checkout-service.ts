/**
 * Checkout Service — production-ready for Laravel API.
 *
 * Architecture:
 *   1. All HTTP calls go through `createServiceFetch(CheckoutError, {...})` which
 *      attaches the JWT Authorization header and handles token refresh.
 *   2. Error handling uses typed `CheckoutError` extending `AppError` for the UI.
 *
 * Expected Laravel endpoints (Sanctum-protected):
 *   POST /checkout          → place order { items, customer, notes, payment_method }
 *   GET  /checkout/verify   → verify cart items are still in stock
 *
 * Brand: Kuwait, KWD currency, +965 phone format.
 */

import { type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";

// ─── Types ────────────────────────────────────────────────────────────

/** Havana only supports cash on delivery — matches Laravel `cash_on_delivery` value */
export type PaymentMethod = "cash_on_delivery";

export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number }>;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface CheckoutResult {
  orderId: string;
  orderNumber: string;
  total: number;
  status: string;
}

export interface StockVerification {
  allAvailable: boolean;
  unavailableItems: Array<{
    productId: string;
    productName: string;
    requested: number;
    available: number;
  }>;
}

export type { FieldErrors };

// ─── Error class ──────────────────────────────────────────────────────

export class CheckoutError extends AppError {
  declare code:
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "TOKEN_EXPIRED"
    | "NETWORK_ERROR"
    | "STOCK_INSUFFICIENT"
    | "PAYMENT_FAILED"
    | "UNKNOWN";

  constructor(
    message: string,
    code: CheckoutError["code"],
    fields: FieldErrors = {}
  ) {
    super(message, code, fields);
    this.name = "CheckoutError";
  }
}

// ─── Laravel API response shapes ──────────────────────────────────────

interface LaravelCheckoutResponse {
  data: {
    order_id: string;
    order_number: string;
    total: number;
    status: string;
  };
}

interface LaravelStockVerification {
  all_available: boolean;
  unavailable_items: Array<{
    product_id: string;
    product_name: string;
    requested: number;
    available: number;
  }>;
}

// ─── Map Laravel responses ────────────────────────────────────────────

function mapLaravelCheckoutResult(raw: LaravelCheckoutResponse["data"]): CheckoutResult {
  return {
    orderId: String(raw.order_id),
    orderNumber: raw.order_number,
    total: raw.total,
    status: raw.status,
  };
}

function mapLaravelStockVerification(raw: LaravelStockVerification): StockVerification {
  return {
    allAvailable: raw.all_available,
    unavailableItems: raw.unavailable_items.map((item) => ({
      productId: String(item.product_id),
      productName: item.product_name,
      requested: item.requested,
      available: item.available,
    })),
  };
}

// ─── Auth-aware fetch for checkout ────────────────────────────────────

const checkoutFetch = createServiceFetch(CheckoutError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Verify cart items are still in stock before checkout.
 */
export async function verifyStock(
  items: Array<{ productId: string; quantity: number }>
): Promise<StockVerification> {
  try {
    const params = new URLSearchParams();
    items.forEach((item) => {
      params.append("items[]", `${item.productId}:${item.quantity}`);
    });

    const data = await checkoutFetch<LaravelStockVerification>(
      `/checkout/verify?${params.toString()}`
    );
    return mapLaravelStockVerification(data);
  } catch (err) {
    if (err instanceof CheckoutError) throw err;
    // Conservative: assume stock check failed → treat as unavailable.
    throw new CheckoutError(
      err instanceof Error ? err.message : "Failed to verify stock",
      "NETWORK_ERROR"
    );
  }
}

/**
 * Place an order.
 */
export async function placeOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  try {
    const data = await checkoutFetch<LaravelCheckoutResponse>("/checkout", {
      method: "POST",
      body: JSON.stringify({
        items: payload.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        customer: {
          name: payload.customer.name,
          email: payload.customer.email,
          phone: payload.customer.phone,
          address: payload.customer.address,
        },
        notes: payload.notes ?? null,
        payment_method: payload.paymentMethod,
      }),
    });
    return mapLaravelCheckoutResult(data.data);
  } catch (err) {
    if (err instanceof CheckoutError) throw err;
    throw new CheckoutError(
      err instanceof Error ? err.message : "Failed to place order",
      "NETWORK_ERROR"
    );
  }
}
