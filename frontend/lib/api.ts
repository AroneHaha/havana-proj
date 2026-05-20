/**
 * API Client — Laravel + Supabase backend interface.
 *
 * Set NEXT_PUBLIC_API_URL in .env.local to point at your Laravel API.
 * While no backend exists yet, the product-service automatically
 * falls back to local seed data (lib/data.ts).
 *
 * Example .env.local:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000/api
 */

import type { ApiResponse, Product } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Generic fetch helper with error handling.
 * Appends locale as a query param so Laravel returns the right translations.
 */
async function fetchApi<T>(
  path: string,
  options?: RequestInit & { locale?: string }
): Promise<T> {
  const { locale, ...init } = options ?? {};

  const url = new URL(path, API_BASE);
  if (locale) url.searchParams.set("locale", locale);

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${res.statusText} — ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Product endpoints ────────────────────────────────────────────────

export const productApi = {
  /** GET /products?filter[is_featured]=1 */
  getFeatured: (locale: string) =>
    fetchApi<ApiResponse<Product>>("/products?filter[is_featured]=1", { locale }),

  /** GET /products?filter[is_best_seller]=1 */
  getBestSellers: (locale: string) =>
    fetchApi<ApiResponse<Product>>("/products?filter[is_best_seller]=1", { locale }),

  /** GET /products/:slug */
  getBySlug: (slug: string, locale: string) =>
    fetchApi<{ data: Product }>(`/products/${slug}`, { locale }),

  /** GET /products?page=1&per_page=12 */
  getAll: (locale: string, page = 1, perPage = 12) =>
    fetchApi<ApiResponse<Product>>(
      `/products?page=${page}&per_page=${perPage}`,
      { locale }
    ),
};

// ─── Health check ─────────────────────────────────────────────────────

export async function isApiAvailable(): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
