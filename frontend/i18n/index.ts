import en from "./locales/en";
import ar from "./locales/ar";
import type { Translation } from "./types";

export type Locale = "en" | "ar";
export type { Translation };

const dictionaries: Record<Locale, Translation> = { en, ar };

export function getDictionary(locale: Locale): Translation {
  return dictionaries[locale] ?? dictionaries.en;
}

/**
 * Resolve a dot-separated key against a translation object.
 * e.g. resolve("hero.title", en) => "Luxury Floral Artistry"
 */
function resolve(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // fallback: return the key itself
    }
  }
  return typeof current === "string" ? current : path;
}

export function translate(locale: Locale, key: string): string {
  const dict = getDictionary(locale);
  return resolve(dict as unknown as Record<string, unknown>, key);
}
