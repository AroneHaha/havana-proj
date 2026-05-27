import type { Locale } from "@/i18n";

/**
 * Format a price in KWD currency with 3 decimal places.
 * Respects the user's locale for numeral rendering.
 */
export function formatPrice(price: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-KW" : "en-KW", {
    style: "currency",
    currency: "KWD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(price);
}
