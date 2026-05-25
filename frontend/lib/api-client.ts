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

// ─── Health check ──────────────────────────────────────────────────────

let _healthChecked = false;
let _healthAvailable = false;

/**
 * Check if the Laravel API is reachable.
 * Result is cached for 5 minutes to avoid redundant health checks.
 */
export async function isApiAvailable(): Promise<boolean> {
  if (!API_BASE) return false;

  if (_healthChecked) return _healthAvailable;

  try {
    const res = await fetch(`${API_BASE}/health`, { method: "GET" });
    _healthAvailable = res.ok;
  } catch {
    _healthAvailable = false;
  }

  _healthChecked = true;
  // Re-check every 5 minutes in case the backend comes online / goes offline
  setTimeout(() => {
    _healthChecked = false;
  }, 5 * 60 * 1000);

  return _healthAvailable;
}
