/**
 * Shared API Configuration — single source of truth.
 *
 * All services must import from here instead of declaring their own API_BASE.
 * This ensures the backend URL is configured in one place.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export { API_BASE };

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