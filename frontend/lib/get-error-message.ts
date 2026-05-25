/**
 * Shared error message extractor — single source of truth.
 *
 * All stores use this pattern to extract a human-readable error message
 * from unknown thrown values. Previously duplicated 6 times across stores.
 */

export function getErrorMessage(err: unknown, fallback = "Request failed"): string {
  if (err && typeof err === "object" && "message" in err) {
    return (err as { message: string }).message;
  }
  return fallback;
}