/**
 * AppError — base class for all service-layer errors.
 *
 * Every service-specific error class (CartError, CheckoutError, etc.)
 * extends this so the UI can catch `instanceof AppError` for generic handling
 * or `instanceof CartError` for service-specific logic.
 *
 * Follows the same `code` + `fields` convention used by OrdersError, ReviewsError,
 * and AuthError — but DRYs up the shared shape.
 */

import type { FieldErrors } from "@/lib/api-config";

export class AppError extends Error {
  code: string;
  fields: FieldErrors;

  constructor(
    message: string,
    code: string,
    fields: FieldErrors = {}
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.fields = fields;
  }
}