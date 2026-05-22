/**
 * Product Service — abstraction over API / mock data.
 *
 * • If NEXT_PUBLIC_API_URL is set AND the API responds, data comes from Laravel.
 * • Otherwise, seed data from lib/data.ts is used — zero config needed.
 *
 * The `localizeProduct` helper resolves `name` and `description` from the
 * `localeText` record on each product, so components always get a flat
 * `product.name` / `product.description` in the current language.
 */

import { productApi, isApiAvailable } from "@/lib/api";
import { featuredProducts, bestSellerProducts } from "@/lib/data";
import type { Product } from "@/types";
import type { Locale } from "@/i18n";

// ─── Locale resolver ──────────────────────────────────────────────────

/**
 * Fill `product.name` and `product.description` from `localeText`
 * for the requested locale. Falls back to "en", then to the first
 * available locale.
 */
export function localizeProduct(product: Product, locale: Locale): Product {
  const text = product.localeText[locale]
    ?? product.localeText["en"]
    ?? Object.values(product.localeText)[0];

  return {
    ...product,
    name: text?.name ?? product.name,
    description: text?.description ?? product.description,
  };
}

// ─── Feature flags ────────────────────────────────────────────────────

let _apiChecked = false;
let _apiAvailable = false;

async function checkApi(): Promise<boolean> {
  if (_apiChecked) return _apiAvailable;
  _apiAvailable = await isApiAvailable();
  _apiChecked = true;
  // Re-check every 5 minutes in case the backend comes online
  setTimeout(() => { _apiChecked = false; }, 5 * 60 * 1000);
  return _apiAvailable;
}

// ─── Public API ───────────────────────────────────────────────────────

export async function getFeaturedProducts(locale: Locale): Promise<Product[]> {
  const useApi = await checkApi();

  if (useApi) {
    try {
      const res = await productApi.getFeatured(locale);
      return (res.data ?? []).map((p) => localizeProduct(p, locale));
    } catch (err) {
      console.warn("API fetch failed, falling back to seed data:", err);
      // fall through to seed data
    }
  }

  return featuredProducts.map((p) => localizeProduct(p, locale));
}

export async function getBestSellerProducts(locale: Locale): Promise<Product[]> {
  const useApi = await checkApi();

  if (useApi) {
    try {
      const res = await productApi.getBestSellers(locale);
      return (res.data ?? []).map((p) => localizeProduct(p, locale));
    } catch (err) {
      console.warn("API fetch failed, falling back to seed data:", err);
    }
  }

  return bestSellerProducts.map((p) => localizeProduct(p, locale));
}

/**
 * Generic product fetch — useful for search, category pages, etc.
 */
export async function getProducts(
  locale: Locale,
  page = 1,
  perPage = 12
): Promise<{ products: Product[]; total: number }> {
  const useApi = await checkApi();

  if (useApi) {
    try {
      const res = await productApi.getAll(locale, page, perPage);
      return {
        products: (res.data ?? []).map((p) => localizeProduct(p, locale)),
        total: res.meta?.total ?? 0,
      };
    } catch (err) {
      console.warn("API fetch failed, falling back to seed data:", err);
    }
  }

  // Merge all seed products for generic listing
  const all = [...featuredProducts, ...bestSellerProducts].map((p) =>
    localizeProduct(p, locale)
  );
  return { products: all, total: all.length };
}