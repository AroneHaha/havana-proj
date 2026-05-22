/**
 * i18n — namespace-based translations with auto-fallback.
 *
 * How it works:
 *   1. Each "module" (nav, home, auth, layout) has its own file in
 *      i18n/namespaces/{en,ar}/.  Add a new module → add one file.
 *   2. `mergeNamespaces()` deep-merges all namespace objects into a
 *      single Translation-shaped object.
 *   3. `withFallback()` deep-fills any missing AR keys from EN, so
 *      you never see a blank string — if an AR translation is missing,
 *      the EN version is used automatically.
 *   4. The legacy monolithic files (locales/en.ts, locales/ar.ts) are
 *      still used as the source of truth until all namespaces are
 *      verified.  When ready, switch `USE_NAMESPACES` to `true`.
 *
 * To add a new module:
 *   1. Create `namespaces/en/myModule.ts` and `namespaces/ar/myModule.ts`
 *   2. Import & add them to the namespace arrays below
 *   3. Add the corresponding type to `types.ts`
 *   4. That's it — no giant file to scroll through
 */

import en from "./locales/en";
import ar from "./locales/ar";
import type { Translation } from "./types";

// ─── Namespace imports ────────────────────────────────────────────────
// When USE_NAMESPACES is true, these are used instead of the monolithic files.

import enNav from "./namespaces/en/nav";
import enHome from "./namespaces/en/home";
import enLayout from "./namespaces/en/layout";
import enAuth from "./namespaces/en/auth";

import arNav from "./namespaces/ar/nav";
import arHome from "./namespaces/ar/home";
import arLayout from "./namespaces/ar/layout";
import arAuth from "./namespaces/ar/auth";

const enNamespaces = [enNav, enHome, enLayout, enAuth];
const arNamespaces = [arNav, arHome, arLayout, arAuth];

// ─── Config ───────────────────────────────────────────────────────────

/**
 * Toggle this to `true` when all namespace files have been verified
 * to match the monolithic originals.  Once true, the monolithic files
 * can be deleted.
 */
const USE_NAMESPACES = false;

// ─── Deep merge utility ───────────────────────────────────────────────

function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

/**
 * Deep-merge multiple objects.  Later objects win on conflicts.
 * Arrays are replaced, not concatenated.
 */
function deepMerge<T extends Record<string, unknown>>(...sources: T[]): T {
  const result: Record<string, unknown> = {};

  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const sourceVal = source[key];
      const targetVal = result[key];

      if (isObject(sourceVal) && isObject(targetVal)) {
        result[key] = deepMerge(
          targetVal as Record<string, unknown>,
          sourceVal as Record<string, unknown>
        );
      } else {
        result[key] = sourceVal;
      }
    }
  }

  return result as T;
}

/**
 * Deep-fill: for any key that exists in `base` but is missing or
 * undefined in `target`, fill it with the `base` value.
 * This is how AR auto-falls back to EN for missing translations.
 */
function withFallback(
  target: Record<string, unknown>,
  base: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(target)) {
    const targetVal = target[key];
    const baseVal = base[key];

    if (isObject(targetVal) && isObject(baseVal)) {
      result[key] = withFallback(targetVal, baseVal);
    } else if (targetVal !== undefined && targetVal !== "") {
      result[key] = targetVal;
    }
    // If targetVal is undefined or "", keep baseVal (already set via spread)
  }

  return result;
}

// ─── Namespace merge ──────────────────────────────────────────────────

function mergeNamespaces(
  namespaces: Record<string, unknown>[]
): Record<string, unknown> {
  return deepMerge({}, ...namespaces);
}

// ─── Public API ───────────────────────────────────────────────────────

export type Locale = "en" | "ar";
export type { Translation };

function buildDictionary(locale: Locale): Translation {
  if (USE_NAMESPACES) {
    const enMerged = mergeNamespaces(enNamespaces);
    if (locale === "en") return enMerged as unknown as Translation;

    const arMerged = mergeNamespaces(arNamespaces);
    return withFallback(arMerged, enMerged) as unknown as Translation;
  }

  // Legacy monolithic mode
  if (locale === "en") return en;
  return withFallback(ar as unknown as Record<string, unknown>, en as unknown as Record<string, unknown>) as unknown as Translation;
}

const dictCache = new Map<Locale, Translation>();

export function getDictionary(locale: Locale): Translation {
  let dict = dictCache.get(locale);
  if (!dict) {
    dict = buildDictionary(locale);
    dictCache.set(locale, dict);
  }
  return dict;
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

/** Clear the dictionary cache (useful when switching locales at runtime) */
export function clearDictCache(): void {
  dictCache.clear();
}
