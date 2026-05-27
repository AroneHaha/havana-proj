/**
 * Service fetch wrapper — maps auth errors to service-specific error classes.
 *
 * Part of the unified API client architecture (see lib/api-client.ts).
 * This module is kept separate because it depends on auth-service,
 * and auth-service cannot import from api-client (circular dependency).
 *
 * Usage:
 *   const productsFetch = createServiceFetch(ProductsError, {
 *     validationCode: "VALIDATION_ERROR",
 *     tokenExpiredCode: "TOKEN_EXPIRED",
 *   });
 *   const data = await productsFetch<MyResponse>("/admin/products", { method: "GET" });
 */

import { authFetch } from "@/services/auth-service";
import type { FieldErrors } from "@/lib/api-config";

export interface ServiceFetchConfig {
  /** Error code to use when mapping a VALIDATION_ERROR from authFetch */
  validationCode: string;
  /** Error code to use when mapping a TOKEN_EXPIRED from authFetch */
  tokenExpiredCode: string;
}

/**
 * Generic service fetch that wraps authFetch and maps auth errors
 * to service-specific error classes.
 *
 * Previously this exact pattern was duplicated in orders-service (ordersFetch)
 * and review-service (reviewsFetch).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyErrorClass = new (message: string, code: any, fields?: FieldErrors) => Error;

export async function serviceFetch<T>(
  fetcher: () => Promise<T>,
  ErrorClass: AnyErrorClass,
  config: ServiceFetchConfig
): Promise<T> {
  try {
    return await fetcher();
  } catch (err: unknown) {
    // Map auth-service errors to service-specific errors
    if (err && typeof err === "object" && "code" in err) {
      const authErr = err as { code: string; message: string; fields?: FieldErrors };
      if (authErr.code === "VALIDATION_ERROR") {
        throw new ErrorClass(authErr.message, config.validationCode, authErr.fields ?? {});
      }
      if (authErr.code === "TOKEN_EXPIRED") {
        throw new ErrorClass("Session expired. Please sign in again.", config.tokenExpiredCode);
      }
    }
    throw new ErrorClass(
      err instanceof Error ? err.message : "Request failed",
      "UNKNOWN"
    );
  }
}

/**
 * Convenience: create a pre-configured fetch wrapper for a service.
 * Returns a function with the same signature as the old ordersFetch/reviewsFetch.
 */
export function createServiceFetch(
  ErrorClass: AnyErrorClass,
  config: ServiceFetchConfig
) {
  return <T>(path: string, options: RequestInit = {}): Promise<T> => {
    return serviceFetch(
      () => authFetch<T>(path, options),
      ErrorClass,
      config
    );
  };
}
