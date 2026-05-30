/**
 * Product Service — abstraction over API / mock data.
 *
 * • If NEXT_PUBLIC_API_URL is set AND the API responds, data comes from Laravel.
 * • Otherwise, seed data from lib/data.ts is used — zero config needed.
 *
 * Architecture (unified API client):
 *   - READ operations (storefront): use `publicFetch` (no auth required)
 *   - WRITE operations (admin CRUD): use `createServiceFetch` (auth required)
 *
 * The `localizeProduct` helper resolves `name` and `description` from the
 * `localeText` record on each product, so components always get a flat
 * `product.name` / `product.description` in the current language.
 */

import { publicFetch, createServiceFetch } from "@/lib/api-client";
import { API_BASE, type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { featuredProducts, bestSellerProducts } from "@/lib/data";
import type { Product } from "@/types";
import type { Locale } from "@/i18n";

// ─── Error class ──────────────────────────────────────────────────────

export class ProductsError extends AppError {
  declare code: "NOT_FOUND" | "VALIDATION_ERROR" | "FORBIDDEN" | "TOKEN_EXPIRED" | "NETWORK_ERROR" | "UNKNOWN";

  constructor(
    message: string,
    code: ProductsError["code"],
    fields: FieldErrors = {}
  ) {
    super(message, code, fields);
    this.name = "ProductsError";
  }
}

export type { FieldErrors };

// ─── Auth-aware fetch for admin operations ─────────────────────────────

const productsFetch = createServiceFetch(ProductsError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

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

// ─── Laravel API response shapes ──────────────────────────────────────

interface LaravelProduct {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  name_ar: string;
  description: string;
  description_en: string;
  description_ar: string;
  price: number;
  sale_price: number | null;
  effective_price: number;
  is_on_sale: boolean;
  image: string;
  images: string[];
  sku?: string;
  stock: number;
  rating: number;
  reviews_count?: number;
  review_count?: number;
  in_stock: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  is_active: boolean;
  category_id: string;
  category?: {
    id: string;
    name: string;
    name_en?: string;
    name_ar?: string;
    slug?: string;
  } | null;
  created_at: string;
}

interface LaravelProductsResponse {
  data: LaravelProduct[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

function mapLaravelProduct(raw: LaravelProduct, locale: Locale): Product {
  // Build localeText from the backend's separate locale fields
  const localeText: Record<string, { name: string; description: string }> = {};
  if (raw.name_en || raw.description_en) {
    localeText.en = { name: raw.name_en ?? raw.name, description: raw.description_en ?? raw.description };
  }
  if (raw.name_ar || raw.description_ar) {
    localeText.ar = { name: raw.name_ar ?? raw.name, description: raw.description_ar ?? raw.description };
  }

  return localizeProduct(
    {
      id: raw.id,
      slug: raw.slug,
      localeText,
      name: raw.name,
      description: raw.description,
      price: raw.price,
      salePrice: raw.sale_price ?? undefined,
      image: raw.image,
      images: raw.images ?? [],
      category: raw.category?.name ?? raw.category_id ?? "",
      categoryId: raw.category_id,
      stock: raw.stock,
      rating: raw.rating,
      reviewCount: raw.reviews_count ?? raw.review_count ?? 0,
      inStock: raw.in_stock,
      isFeatured: raw.is_featured,
      isBestSeller: raw.is_best_seller,
      isNew: raw.is_new ?? undefined,
      createdAt: raw.created_at,
    },
    locale
  );
}

// ─── READ operations (public, storefront) ─────────────────────────────

export async function getFeaturedProducts(locale: Locale): Promise<Product[]> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const res = await publicFetch<LaravelProductsResponse>(
        "/products?filter[is_featured]=1",
        { locale }
      );
      return (res.data ?? []).map((p) => mapLaravelProduct(p, locale));
    } catch (err) {
      // When API is configured, errors must surface — never silently fall back to mock.
      if (err instanceof ProductsError) throw err;
      throw new ProductsError(
        err instanceof Error ? err.message : "Failed to fetch products",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  return featuredProducts.map((p) => localizeProduct(p, locale));
}

export async function getBestSellerProducts(locale: Locale): Promise<Product[]> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const res = await publicFetch<LaravelProductsResponse>(
        "/products?filter[is_best_seller]=1",
        { locale }
      );
      return (res.data ?? []).map((p) => mapLaravelProduct(p, locale));
    } catch (err) {
      if (err instanceof ProductsError) throw err;
      throw new ProductsError(
        err instanceof Error ? err.message : "Failed to fetch best sellers",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
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
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const res = await publicFetch<LaravelProductsResponse>(
        `/products?page=${page}&per_page=${perPage}`,
        { locale }
      );
      return {
        products: (res.data ?? []).map((p) => mapLaravelProduct(p, locale)),
        total: res.meta?.total ?? 0,
      };
    } catch (err) {
      if (err instanceof ProductsError) throw err;
      throw new ProductsError(
        err instanceof Error ? err.message : "Failed to fetch products",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  const all = [...featuredProducts, ...bestSellerProducts].map((p) =>
    localizeProduct(p, locale)
  );
  return { products: all, total: all.length };
}

/**
 * Fetch a single product by ID.
 * Expected Laravel endpoint: GET /products/:id
 */
export async function fetchProductById(
  id: string,
  locale: Locale = "en"
): Promise<Product | null> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const res = await publicFetch<{ data: LaravelProduct }>(
        `/products/${id}`,
        { locale }
      );
      return mapLaravelProduct(res.data, locale);
    } catch (err) {
      if (err instanceof ProductsError) throw err;
      throw new ProductsError(
        err instanceof Error ? err.message : "Failed to fetch product",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 100));
  const all = [...featuredProducts, ...bestSellerProducts];
  const found = all.find((p) => p.id === id) ?? null;
  return found ? localizeProduct(found, locale) : null;
}

// ─── WRITE operations (admin, authenticated) ───────────────────────────

/**
 * Create a new product.
 * Expected Laravel endpoint: POST /admin/products
 */
export async function createProduct(
  data: Omit<Product, "id" | "slug" | "rating" | "reviewCount" | "createdAt">,
  locale: Locale = "en",
  rawFiles?: File[]
): Promise<Product> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      // If we have raw files, use FormData (multipart/form-data) so Laravel
      // receives actual file uploads in $_FILES instead of base64 JSON strings.
      if (rawFiles && rawFiles.length > 0) {
        const fd = new FormData();
        // Backend expects name_en/name_ar/description_en/description_ar
        // (NOT name/description/locale_text)
        const localeText = data.localeText ?? {};
        fd.append("name_en", localeText.en?.name ?? data.name);
        fd.append("name_ar", localeText.ar?.name ?? data.name);
        fd.append("description_en", localeText.en?.description ?? data.description ?? "");
        fd.append("description_ar", localeText.ar?.description ?? data.description ?? "");
        fd.append("price", String(data.price));
        if (data.salePrice != null) fd.append("sale_price", String(data.salePrice));
        fd.append("category_id", data.category);
        fd.append("stock", String(data.stock));
        fd.append("in_stock", String(data.stock > 0));
        fd.append("is_featured", data.isFeatured ? "1" : "0");
        fd.append("is_best_seller", data.isBestSeller ? "1" : "0");
        fd.append("is_new", data.isNew ? "1" : "0");
        if (data.sku) fd.append("sku", data.sku);
        // New file uploads
        rawFiles.forEach((file, i) => {
          fd.append(`images[${i}]`, file);
        });
        // Existing image URLs (not data: URIs)
        (data.images ?? []).forEach((img) => {
          if (!img.startsWith("data:")) {
            fd.append("existing_images[]", img);
          }
        });

        const res = await productsFetch<{ data: LaravelProduct }>("/admin/products", {
          method: "POST",
          body: fd as unknown as BodyInit,
          // Let the browser set Content-Type with boundary for FormData
        });
        return mapLaravelProduct(res.data, locale);
      }

      // No raw files — send as JSON
      // Backend expects name_en/name_ar/description_en/description_ar
      // (NOT name/description/locale_text)
      const localeText = data.localeText ?? {};
      const res = await productsFetch<{ data: LaravelProduct }>("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          name_en: localeText.en?.name ?? data.name,
          name_ar: localeText.ar?.name ?? data.name,
          description_en: localeText.en?.description ?? data.description ?? "",
          description_ar: localeText.ar?.description ?? data.description ?? "",
          price: data.price,
          sale_price: data.salePrice ?? null,
          image: data.image,
          images: data.images ?? [],
          category_id: data.category,
          stock: data.stock,
          in_stock: data.stock > 0,
          is_featured: data.isFeatured ?? false,
          is_best_seller: data.isBestSeller ?? false,
          is_new: data.isNew ?? false,
        }),
      });
      return mapLaravelProduct(res.data, locale);
    } catch (err) {
      if (err instanceof ProductsError) throw err;
      throw new ProductsError(
        err instanceof Error ? err.message : "Failed to create product",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 300));
  const id = `prod_${Date.now()}`;
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    ...data,
    id,
    slug,
    inStock: data.stock > 0,
    rating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Update an existing product.
 * Expected Laravel endpoint: PATCH /admin/products/:id
 */
export async function updateProduct(
  id: string,
  data: Partial<Product>,
  locale: Locale = "en",
  rawFiles?: File[]
): Promise<Product> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      // If we have raw files, use FormData (multipart/form-data) so Laravel
      // receives actual file uploads in $_FILES instead of base64 JSON strings.
      if (rawFiles && rawFiles.length > 0) {
        const fd = new FormData();
        // Laravel method spoofing: FormData must be POST, but we add
        // _method=PATCH so Laravel routes it to the PATCH handler.
        fd.append("_method", "PATCH");
        // Backend expects name_en/name_ar/description_en/description_ar
        // (NOT name/description/locale_text)
        const lt = data.localeText ?? {};
        if (data.name !== undefined) {
          fd.append("name_en", lt.en?.name ?? data.name);
          fd.append("name_ar", lt.ar?.name ?? data.name);
        }
        if (data.description !== undefined) {
          fd.append("description_en", lt.en?.description ?? data.description ?? "");
          fd.append("description_ar", lt.ar?.description ?? data.description ?? "");
        }
        if (data.price !== undefined) fd.append("price", String(data.price));
        if (data.salePrice !== undefined) fd.append("sale_price", String(data.salePrice));
        if (data.category !== undefined) fd.append("category_id", data.category);
        if (data.stock !== undefined) {
          fd.append("stock", String(data.stock));
          fd.append("in_stock", String(data.stock > 0));
        }
        if (data.isFeatured !== undefined) fd.append("is_featured", data.isFeatured ? "1" : "0");
        if (data.isBestSeller !== undefined) fd.append("is_best_seller", data.isBestSeller ? "1" : "0");
        if (data.isNew !== undefined) fd.append("is_new", data.isNew ? "1" : "0");
        if (data.sku) fd.append("sku", data.sku);
        // New file uploads
        rawFiles.forEach((file, i) => {
          fd.append(`images[${i}]`, file);
        });
        // Existing image URLs (not data: URIs) that should be kept
        (data.images ?? []).forEach((img) => {
          if (!img.startsWith("data:")) {
            fd.append("existing_images[]", img);
          }
        });

        const res = await productsFetch<{ data: LaravelProduct }>(
          `/admin/products/${id}`,
          {
            method: "POST",
            body: fd as unknown as BodyInit,
            // Let the browser set Content-Type with boundary for FormData
          }
        );
        return mapLaravelProduct(res.data, locale);
      }

      // No raw files — send as JSON (PATCH)
      // Backend expects name_en/name_ar/description_en/description_ar
      // (NOT name/description/locale_text)
      const body: Record<string, unknown> = {};
      const lt = data.localeText ?? {};
      if (data.name !== undefined) {
        body.name_en = lt.en?.name ?? data.name;
        body.name_ar = lt.ar?.name ?? data.name;
      }
      if (data.description !== undefined) {
        body.description_en = lt.en?.description ?? data.description ?? "";
        body.description_ar = lt.ar?.description ?? data.description ?? "";
      }
      if (data.price !== undefined) body.price = data.price;
      if (data.salePrice !== undefined) body.sale_price = data.salePrice;
      if (data.image !== undefined) body.image = data.image;
      if (data.images !== undefined) body.images = data.images;
      if (data.category !== undefined) body.category_id = data.category;
      if (data.stock !== undefined) {
        body.stock = data.stock;
        body.in_stock = data.stock > 0;
      }
      if (data.isFeatured !== undefined) body.is_featured = data.isFeatured;
      if (data.isBestSeller !== undefined) body.is_best_seller = data.isBestSeller;
      if (data.isNew !== undefined) body.is_new = data.isNew;

      const res = await productsFetch<{ data: LaravelProduct }>(
        `/admin/products/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        }
      );
      return mapLaravelProduct(res.data, locale);
    } catch (err) {
      if (err instanceof ProductsError) throw err;
      throw new ProductsError(
        err instanceof Error ? err.message : "Failed to update product",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 300));

  // Find in seed data
  const allProducts = [...featuredProducts, ...bestSellerProducts];
  const existing = allProducts.find((p) => p.id === id);
  if (!existing) {
    throw new ProductsError("Product not found", "NOT_FOUND");
  }

  const updated = { ...existing, ...data };
  updated.inStock = updated.stock > 0;
  return updated;
}

/**
 * Delete a product.
 * Expected Laravel endpoint: DELETE /admin/products/:id
 */
export async function deleteProduct(id: string): Promise<boolean> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      await productsFetch<{ message: string }>(`/admin/products/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      if (err instanceof ProductsError) throw err;
      throw new ProductsError(
        err instanceof Error ? err.message : "Failed to delete product",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 200));

  const allProducts = [...featuredProducts, ...bestSellerProducts];
  const idx = allProducts.findIndex((p) => p.id === id);
  if (idx === -1) {
    throw new ProductsError("Product not found", "NOT_FOUND");
  }
  return true;
}

/**
 * Fetch product statistics for admin dashboard.
 * Expected Laravel endpoint: GET /admin/products/stats
 */
export async function fetchProductStats(): Promise<ProductStats> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const response = await productsFetch<LaravelStatsResponse>(
        "/admin/products/stats"
      );
      // Backend respondWithStats() wraps in { data: {...} }
      const data = response.data;
      return {
        totalProducts: data.total_products,
        totalValue: data.total_value,
        lowStockCount: data.low_stock_count,
        outOfStockCount: data.out_of_stock_count,
      };
    } catch (err) {
      if (err instanceof ProductsError) throw err;
      throw new ProductsError(
        err instanceof Error ? err.message : "Failed to fetch product stats",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 100));

  const allProducts = [...featuredProducts, ...bestSellerProducts];
  const lowStock = allProducts.filter((p) => p.stock > 0 && p.stock < 10);
  const outOfStock = allProducts.filter((p) => p.stock <= 0);
  const totalValue = allProducts.reduce(
    (sum, p) => sum + (p.salePrice ?? p.price) * p.stock,
    0
  );

  return {
    totalProducts: allProducts.length,
    totalValue,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
  };
}

// ─── Types ────────────────────────────────────────────────────────────

export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface LaravelProductStats {
  total_products: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

/** Backend respondWithStats() wraps in { data: {...} } */
interface LaravelStatsResponse {
  data: LaravelProductStats;
}

// ─── Categories ────────────────────────────────────────────────────────

/**
 * Category returned by GET /api/categories
 * Used by the product form dropdown (sends UUID as category_id).
 */
export interface Category {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  slug: string;
}

interface LaravelCategory {
  id: string;
  name: string;
  name_en: string;
  name_ar: string;
  slug: string;
  image?: string;
  is_active?: boolean;
  sort_order?: number;
  products_count?: number;
}

/**
 * Fetch categories from the API. Used by the product form to
 * populate the category dropdown with real UUIDs.
 *
 * When API is not configured, returns the hardcoded PRODUCT_CATEGORIES
 * as a fallback (with synthetic IDs for mock mode).
 */
export async function fetchCategories(locale: Locale = "en"): Promise<Category[]> {
  if (API_BASE) {
    try {
      const res = await publicFetch<{ data: LaravelCategory[] }>("/categories", { locale });
      return (res.data ?? []).map((c) => ({
        id: c.id,
        name: locale === "ar" ? c.name_ar : c.name_en,
        nameEn: c.name_en,
        nameAr: c.name_ar,
        slug: c.slug,
      }));
    } catch {
      // Fall through to mock fallback
    }
  }

  // Mock fallback — no UUIDs, just use slug as ID
  const { PRODUCT_CATEGORIES } = await import("@/lib/constant");
  return PRODUCT_CATEGORIES.map((name, i) => ({
    id: `cat-mock-${i}`,
    name,
    nameEn: name,
    nameAr: name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  }));
}
