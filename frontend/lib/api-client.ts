/**
 * Unified API Client — single entry point for all HTTP requests.
 *
 * Provides two fetch strategies:
 *   1. `publicFetch`  — unauthenticated, for storefront browsing (products, etc.)
 *   2. `authFetch`    — authenticated, for admin operations (orders, reviews, CRUD)
 *      Wrapped via `createServiceFetch` for typed error mapping.
 *
 * Both include in-flight request deduplication: if the same URL + options
 * is already being fetched, the pending Promise is returned instead of
 * firing a duplicate request. This prevents React 18 StrictMode double-mount
 * from sending duplicate network calls.
 *
 * All services import from this single module. The only exception is
 * `auth-service.ts`, which defines `authFetch` itself and therefore
 * can't import from here (circular dependency).
 */

import { API_BASE } from "@/lib/api-config";
import type { Locale } from "@/i18n";

// ─── In-flight request deduplication ───────────────────────────────────

const pendingRequests = new Map<string, Promise<unknown>>();

/**
 * Deduplicate in-flight GET requests by cache key.
 * Only active for GET requests (no side effects).
 * Non-GET requests (POST, PATCH, DELETE) always execute immediately.
 */
function dedupFetch<T>(cacheKey: string, factory: () => Promise<T>, method?: string): Promise<T> {
  // Only dedup read requests — writes must always go through
  if (method && method.toUpperCase() !== "GET") {
    return factory();
  }

  const existing = pendingRequests.get(cacheKey);
  if (existing) return existing as Promise<T>;

  const promise = factory().finally(() => {
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, promise);
  return promise;
}

function buildCacheKey(path: string, options?: RequestInit & { locale?: Locale }): string {
  const method = options?.method ?? "GET";
  const locale = (options as { locale?: Locale })?.locale ?? "";
  return `${method}:${locale}:${path}`;
}

// ─── Public (unauthenticated) fetch ────────────────────────────────────

/**
 * Fetch wrapper for public endpoints — no auth token attached.
 * Appends locale as a query param so Laravel returns the right translations.
 *
 * Includes in-flight deduplication for GET requests.
 * Use for: storefront product browsing, public catalog pages.
 */
export async function publicFetch<T>(
  path: string,
  options?: RequestInit & { locale?: Locale }
): Promise<T> {
  const { locale, ...init } = options ?? {};
  const cacheKey = buildCacheKey(path, options);

  return dedupFetch<T>(cacheKey, async () => {
    // Build URL using template literal (same pattern as authFetch).
    // IMPORTANT: Do NOT use new URL(path, base) — it treats leading "/" as
    // absolute and strips the /api prefix from API_BASE. Use string concat instead.
    const separator = path.startsWith("?") ? "" : (path.startsWith("/") ? "" : "/");
    let urlStr = `${API_BASE}${separator}${path}`;

    // Append locale as query parameter
    if (locale) {
      const joinChar = urlStr.includes("?") ? "&" : "?";
      urlStr += `${joinChar}locale=${encodeURIComponent(locale)}`;
    }

    const res = await fetch(urlStr, {
      headers: {
        // When body is FormData, let the browser set Content-Type with boundary
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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
  }, init.method);
}

// ─── Authenticated fetch ───────────────────────────────────────────────

// Re-export from auth-service (the canonical source of authFetch)
export { authFetch } from "@/services/auth-service";

// Re-export the service fetch wrapper (for typed error mapping)
export { createServiceFetch, serviceFetch } from "@/lib/service-fetch";
export type { ServiceFetchConfig } from "@/lib/service-fetch";

// NOTE: The old `isApiAvailable()` health-check function has been removed.
// All services now call the API directly with proper error handling.