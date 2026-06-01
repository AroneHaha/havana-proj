/**
 * Shared API Configuration — single source of truth.
 *
 * All services must import from here instead of declaring their own API_BASE.
 * This ensures the backend URL is configured in one place.
 *
 * Includes API health-check mechanism so the frontend can detect
 * when the backend is unreachable and show clear user feedback
 * instead of generic "Failed to fetch" errors.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export { API_BASE };

// ─── API Availability Detection ──────────────────────────────────────

/** Current API availability state */
let apiAvailable: boolean | null = null; // null = not yet checked

/**
 * Check if the backend API is reachable.
 * Calls GET /api/auth/ping (unauthenticated, lightweight).
 * Caches the result for 30 seconds to avoid hammering the server.
 */
let lastCheckTime = 0;
const CHECK_INTERVAL_MS = 30_000; // 30 seconds

export async function checkApiAvailability(): Promise<boolean> {
  if (!API_BASE) {
    // No API URL configured
    apiAvailable = false;
    return false;
  }

  const now = Date.now();
  if (apiAvailable !== null && now - lastCheckTime < CHECK_INTERVAL_MS) {
    return apiAvailable;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(`${API_BASE}/auth/ping`, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);
    apiAvailable = res.ok;
    lastCheckTime = now;
  } catch {
    apiAvailable = false;
    lastCheckTime = now;
  }

  return apiAvailable;
}

/**
 * Get the last known API availability state (synchronous).
 * Returns null if not yet checked.
 */
export function getApiAvailability(): boolean | null {
  return apiAvailable;
}

/**
 * Manually set API availability (e.g., after a successful request).
 */
export function setApiAvailable(available: boolean): void {
  apiAvailable = available;
  lastCheckTime = Date.now();
}

/**
 * Returns a user-friendly message explaining why the API is unreachable.
 * Use this in error handlers instead of showing raw "Failed to fetch".
 */
export function getApiUnavailableMessage(): string {
  if (!API_BASE) {
    return "API is not configured.";
  }
  return "Unable to connect to the server. Please ensure the backend is running and try again.";
}

// ─── Shared Types ──────────────────────────────────────────────────────

/** Per-field validation errors returned by Laravel */
export interface FieldErrors {
  [field: string]: string[];
}

/** Laravel validation error response shape (422) */
export interface LaravelValidationErrorResponse {
  message: string;
  errors: { [field: string]: string[] };
}

/** Standard Laravel paginated response meta */
export interface LaravelPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
