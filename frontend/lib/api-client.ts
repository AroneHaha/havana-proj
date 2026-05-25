/**
 * Unified API Client — single entry point for all HTTP requests.
 *
 * Provides two fetch strategies:
 *   1. `publicFetch`  — unauthenticated, for storefront browsing (products, etc.)
 *   2. `authFetch`    — authenticated, for admin operations (orders, reviews, CRUD)
 *      Wrapped via `createServiceFetch` for typed error mapping.
 *
 * Replaces the old dual-architecture:
 *   - lib/api.ts         (public, no auth, productApi object)  ← REMOVED
 *   - lib/service-fetch.ts (auth, via authFetch wrapper)       ← MERGED HERE
 *
 * All services import from this single module. The only exception is
 * `auth-service.ts`, which defines `authFetch` itself and therefore
 * can't import from here (circular dependency).
 */

import { API_BASE } from "@/lib/api-config";
import type { Locale } from "@/i18n";

// ─── Public (unauthenticated) fetch ────────────────────────────────────

/**
 * Fetch wrapper for public endpoints — no auth token attached.
 * Appends locale as a query param so Laravel returns the right translations.
 *
 * Use for: storefront product browsing, public catalog pages.
 */
export async function publicFetch<T>(
  path: string,
  options?: RequestInit & { locale?: Locale }
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

// ─── Authenticated fetch ───────────────────────────────────────────────

// Re-export from auth-service (the canonical source of authFetch)
export { authFetch } from "@/services/auth-service";

// Re-export the service fetch wrapper (for typed error mapping)
export { createServiceFetch, serviceFetch } from "@/lib/service-fetch";
export type { ServiceFetchConfig } from "@/lib/service-fetch";

// NOTE: The old `isApiAvailable()` health-check function has been removed.
// All services now use the consistent `if (API_BASE) { try { ... } catch { /* mock fallback */ } }`
// pattern, which is simpler and avoids an extra network round-trip.
