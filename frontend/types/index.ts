/**
 * Localized text — the API returns name/description per locale.
 */
export interface ProductLocaleText {
  name: string;
  description: string;
}

/**
 * The canonical Product shape — backend-ready.
 *
 * Every field here maps 1:1 to the Laravel API JSON response.
 */
export interface Product {
  id: string;
  slug: string;

  /** Locale-keyed text — e.g. { en: {name:"Royal Rose", description:"..."}, ar: {name:"الورد الملكي", description:"..."} } */
  name: string;           // convenience: current-locale name (set by service)
  description: string;    // convenience: current-locale description (set by service)
  localeText: Record<string, ProductLocaleText>; // full i18n payload from API

  price: number;
  salePrice?: number;
  image: string;
  images?: string[];
  category: string;
  sku?: string;
  stock: number;          // actual inventory count from backend
  rating: number;
  reviewCount: number;
  inStock: boolean;       // derived: stock > 0
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  createdAt?: string;     // ISO date from DB
}

export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Standard API response wrapper — Laravel paginated responses.
 */
export interface ApiResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type ProductStatus = "in_stock" | "low_stock" | "sold_out";

export type ProductFilterStatus = "all" | "in_stock" | "low_stock" | "sold_out";