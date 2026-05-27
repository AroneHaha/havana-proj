/**
 * Orders Service — production-ready for Laravel + Supabase.
 *
 * Architecture:
 *   1. All HTTP calls go through `authFetch()` (from auth-service) which
 *      attaches the JWT Authorization header and handles token refresh.
 *   2. Laravel API responses are mapped to our canonical `Order` type.
 *   3. When `NEXT_PUBLIC_API_URL` is not set (dev without backend),
 *      everything falls back to mock data — zero config needed.
 *   4. Error handling uses strongly-typed `OrdersError` for the UI.
 *
 * Expected Laravel endpoints (Sanctum-protected):
 *   GET    /admin/orders              → paginated list (with ?status=&date_from=&date_to=&search=)
 *   GET    /admin/orders/:id          → single order detail
 *   PATCH  /admin/orders/:id/status   { status } → update status
 *   DELETE /admin/orders/:id          → soft-delete order
 *   GET    /admin/orders/stats        → { revenue, avgOrderValue, statusCounts }
 *   PATCH  /admin/orders/:id/cancel   → cancel order (alias for status=cancelled)
 *
 * When Supabase is added:
 *   - Replace `authFetch` with Supabase client methods
 *   - The `Order` shape stays the same (Supabase row → our Order mapping)
 */

import { API_BASE, type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";
import { type OrderStatus } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────

// Re-export OrderStatus from @/types for backward compatibility
// (consumers importing from this service still work)
export type { OrderStatus } from "@/types";

export type PaymentMethod = "cash" | "card" | "online";

/** The canonical status flow — each step advances to the next */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

/** Maps status → i18n key under admin.orders */
export const STATUS_I18N_KEY: Record<OrderStatus, string> = {
  pending: "pending",
  confirmed: "confirmed",
  preparing: "preparing",
  out_for_delivery: "outForDelivery",
  delivered: "delivered",
  cancelled: "cancelled",
};

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  /** Display order number (e.g. "HV-1001") — shown to users */
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  totalRevenue: number;
  averageOrderValue: number;
  statusCounts: Record<OrderStatus, number>;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  currentPage: number;
  lastPage: number;
}

// FieldErrors is now imported from lib/api-config
export type { FieldErrors };

export class OrdersError extends AppError {
  declare code:
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "TOKEN_EXPIRED"
    | "NETWORK_ERROR"
    | "STATUS_CONFLICT"
    | "UNKNOWN";

  constructor(
    message: string,
    code: OrdersError["code"],
    fields: FieldErrors = {}
  ) {
    super(message, code, fields);
    this.name = "OrdersError";
  }
}

// ─── Laravel API response shapes ──────────────────────────────────────

interface LaravelOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface LaravelOrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface LaravelOrder {
  id: string;
  order_number: string;
  customer: LaravelOrderCustomer;
  items: LaravelOrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface LaravelOrdersListResponse {
  data: LaravelOrder[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface LaravelOrderStats {
  total_revenue: number;
  average_order_value: number;
  status_counts: Record<OrderStatus, number>;
}

// LaravelValidationErrorResponse is now imported from lib/api-config

// ─── Map Laravel order → Order ────────────────────────────────────────

function mapLaravelOrder(raw: LaravelOrder): Order {
  return {
    id: String(raw.id),
    orderNumber: raw.order_number,
    customer: {
      name: raw.customer.name,
      email: raw.customer.email,
      phone: raw.customer.phone,
      address: raw.customer.address,
    },
    items: raw.items.map((item) => ({
      productId: String(item.product_id),
      productName: item.product_name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: raw.subtotal,
    deliveryFee: raw.delivery_fee,
    total: raw.total,
    status: raw.status,
    paymentMethod: raw.payment_method,
    notes: raw.notes ?? undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ─── Auth-aware fetch for orders (reuses auth-service) ────────────────

const ordersFetch = createServiceFetch(OrdersError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

// ─── Mock data (Kuwait-based luxury floral shop) ──────────────────────

// Helper: generate ISO date string relative to today
function daysAgo(days: number, hour: number, min: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

// Helper: generate ISO date string for a specific date (absolute)
function dateOn(year: number, month: number, day: number, hour: number, min: number): string {
  const d = new Date(year, month - 1, day, hour, min, 0, 0);
  return d.toISOString();
}

const MOCK_ORDERS: Order[] = [
  {
    id: "1", orderNumber: "HV-1001",
    customer: { name: "Ahmad Al-Sabah", email: "ahmad@email.com", phone: "+965 5551 0001", address: "Salmiya, Block 12, St 5, Bldg 3" },
    items: [{ productId: "fp1", productName: "Royal Rose Symphony", quantity: 2, price: 69.900 }],
    subtotal: 139.800, deliveryFee: 0, total: 139.800, status: "pending", paymentMethod: "cash",
    notes: "Please include a birthday card", createdAt: daysAgo(0, 10, 30), updatedAt: daysAgo(0, 10, 30),
  },
  {
    id: "2", orderNumber: "HV-1002",
    customer: { name: "Sara Mahmoud", email: "sara@email.com", phone: "+965 5552 0002", address: "Kuwait City, Sharq, Ahmed Al-Jaber St" },
    items: [{ productId: "fp2", productName: "Golden Hour Bouquet", quantity: 1, price: 62.000 }, { productId: "fp3", productName: "Midnight Orchid Elegance", quantity: 3, price: 99.900 }],
    subtotal: 361.700, deliveryFee: 0, total: 361.700, status: "confirmed", paymentMethod: "cash",
    createdAt: daysAgo(0, 9, 15), updatedAt: daysAgo(0, 9, 45),
  },
  {
    id: "3", orderNumber: "HV-1003",
    customer: { name: "Khalid Al-Ali", email: "khalid@email.com", phone: "+965 5553 0003", address: "Jabriya, Block 7, St 3, Villa 45" },
    items: [{ productId: "fp4", productName: "Pearl White Lilies", quantity: 1, price: 78.000 }],
    subtotal: 78.000, deliveryFee: 3.000, total: 81.000, status: "preparing", paymentMethod: "cash",
    createdAt: daysAgo(0, 8, 0), updatedAt: daysAgo(0, 8, 30),
  },
  {
    id: "4", orderNumber: "HV-1004",
    customer: { name: "Fatima Al-Kandari", email: "fatima@email.com", phone: "+965 5554 0004", address: "Hawally, Block 4, St 22, House 8" },
    items: [{ productId: "bs1", productName: "Classic Red Rose Box", quantity: 1, price: 55.000 }, { productId: "bs3", productName: "Tulip Paradise", quantity: 1, price: 48.000 }],
    subtotal: 103.000, deliveryFee: 3.000, total: 106.000, status: "out_for_delivery", paymentMethod: "cash",
    createdAt: daysAgo(1, 14, 0), updatedAt: daysAgo(0, 7, 0),
  },
  {
    id: "5", orderNumber: "HV-1005",
    customer: { name: "Omar Hassan", email: "omar@email.com", phone: "+965 5555 0005", address: "Mishref, Block 2, St 9, Bldg 3" },
    items: [{ productId: "bs4", productName: "Luxury White & Gold", quantity: 2, price: 89.900 }],
    subtotal: 179.800, deliveryFee: 0, total: 179.800, status: "delivered", paymentMethod: "cash",
    createdAt: daysAgo(2, 11, 0), updatedAt: daysAgo(2, 16, 30),
  },
  {
    id: "6", orderNumber: "HV-1006",
    customer: { name: "Noor Al-Emadi", email: "noor@email.com", phone: "+965 5556 0006", address: "Bayan, Block 1, St 6, Villa 12" },
    items: [{ productId: "fp1", productName: "Royal Rose Symphony", quantity: 1, price: 69.900 }],
    subtotal: 69.900, deliveryFee: 3.000, total: 72.900, status: "delivered", paymentMethod: "cash",
    createdAt: daysAgo(3, 13, 20), updatedAt: daysAgo(3, 17, 0),
  },
  {
    id: "7", orderNumber: "HV-1007",
    customer: { name: "Youssef Ibrahim", email: "youssef@email.com", phone: "+965 5557 0007", address: "Salwa, Block 5, St 14, Tower 8" },
    items: [{ productId: "bs2", productName: "Pastel Dream Arrangement", quantity: 5, price: 59.900 }],
    subtotal: 290.000, deliveryFee: 0, total: 290.000, status: "delivered", paymentMethod: "cash",
    createdAt: daysAgo(5, 9, 0), updatedAt: daysAgo(5, 14, 0),
  },
  {
    id: "8", orderNumber: "HV-1008",
    customer: { name: "Layla Al-Shammari", email: "layla@email.com", phone: "+965 5558 0008", address: "Al Nuzha, Block 3, St 8" },
    items: [{ productId: "bs3", productName: "Tulip Paradise", quantity: 1, price: 48.000 }, { productId: "fp4", productName: "Pearl White Lilies", quantity: 1, price: 78.000 }],
    subtotal: 126.000, deliveryFee: 0, total: 126.000, status: "cancelled", paymentMethod: "cash",
    notes: "Customer changed mind", createdAt: daysAgo(1, 16, 0), updatedAt: daysAgo(1, 18, 0),
  },
  {
    id: "9", orderNumber: "HV-1009",
    customer: { name: "Hassan Mirza", email: "hassan@email.com", phone: "+965 5559 0009", address: "Kaifan, Block 6, St 2, Villa 12" },
    items: [{ productId: "bs3", productName: "Tulip Paradise", quantity: 3, price: 48.000 }],
    subtotal: 144.000, deliveryFee: 3.000, total: 147.000, status: "delivered", paymentMethod: "cash",
    createdAt: daysAgo(8, 10, 0), updatedAt: daysAgo(8, 15, 0),
  },
  {
    id: "10", orderNumber: "HV-1010",
    customer: { name: "Maryam Al-Sayed", email: "maryam@email.com", phone: "+965 5560 0010", address: "Al Bida, Block 1, Tower 22" },
    items: [{ productId: "fp2", productName: "Golden Hour Bouquet", quantity: 1, price: 62.000 }],
    subtotal: 62.000, deliveryFee: 3.000, total: 65.000, status: "pending", paymentMethod: "cash",
    notes: "Wedding on Saturday. Delivery by 8 AM.", createdAt: daysAgo(0, 11, 0), updatedAt: daysAgo(0, 11, 0),
  },
  {
    id: "11", orderNumber: "HV-1011",
    customer: { name: "Aisha Al-Hamad", email: "aisha@email.com", phone: "+965 5561 0011", address: "Rumaithiya, Block 8, St 7, Villa 7" },
    items: [{ productId: "bs4", productName: "Luxury White & Gold", quantity: 1, price: 89.900 }, { productId: "bs3", productName: "Tulip Paradise", quantity: 2, price: 48.000 }],
    subtotal: 185.900, deliveryFee: 0, total: 185.900, status: "pending", paymentMethod: "cash",
    notes: "Surprise delivery — do not call recipient", createdAt: daysAgo(0, 12, 15), updatedAt: daysAgo(0, 12, 15),
  },
  {
    id: "12", orderNumber: "HV-1012",
    customer: { name: "Mohammed Al-Attiyah", email: "mohammed@email.com", phone: "+965 5562 0012", address: "Farwaniya, Block 9, St 11, Bldg 9" },
    items: [{ productId: "fp1", productName: "Royal Rose Symphony", quantity: 1, price: 69.900 }],
    subtotal: 69.900, deliveryFee: 3.000, total: 72.900, status: "confirmed", paymentMethod: "cash",
    createdAt: daysAgo(0, 13, 0), updatedAt: daysAgo(0, 13, 30),
  },
  // ─── Additional mock orders spanning 2024-2026 ───
  {
    id: "13", orderNumber: "HV-1013",
    customer: { name: "Reem Al-Fulaij", email: "reem@email.com", phone: "+965 5570 0013", address: "Jabriya, Block 3, St 12, Villa 9" },
    items: [{ productId: "fp3", productName: "Midnight Orchid Elegance", quantity: 1, price: 99.900 }],
    subtotal: 99.900, deliveryFee: 0, total: 99.900, status: "delivered", paymentMethod: "cash",
    notes: "Anniversary surprise", createdAt: dateOn(2024, 3, 15, 10, 0), updatedAt: dateOn(2024, 3, 15, 16, 30),
  },
  {
    id: "14", orderNumber: "HV-1014",
    customer: { name: "Tariq Al-Mutairi", email: "tariq@email.com", phone: "+965 5571 0014", address: "Salmiya, Block 8, St 2, Bldg 14" },
    items: [{ productId: "fp2", productName: "Golden Hour Bouquet", quantity: 2, price: 62.000 }, { productId: "fp1", productName: "Royal Rose Symphony", quantity: 1, price: 69.900 }],
    subtotal: 193.900, deliveryFee: 3.000, total: 196.900, status: "delivered", paymentMethod: "cash",
    createdAt: dateOn(2024, 6, 22, 14, 30), updatedAt: dateOn(2024, 6, 22, 19, 0),
  },
  {
    id: "15", orderNumber: "HV-1015",
    customer: { name: "Mona Al-Otaibi", email: "mona@email.com", phone: "+965 5572 0015", address: "Hawally, Block 6, St 18, House 22" },
    items: [{ productId: "bs4", productName: "Luxury White & Gold", quantity: 1, price: 89.900 }],
    subtotal: 89.900, deliveryFee: 0, total: 89.900, status: "delivered", paymentMethod: "cash",
    createdAt: dateOn(2024, 9, 10, 9, 45), updatedAt: dateOn(2024, 9, 10, 14, 0),
  },
  {
    id: "16", orderNumber: "HV-1016",
    customer: { name: "Faisal Al-Dosari", email: "faisal@email.com", phone: "+965 5573 0016", address: "Mishref, Block 4, St 7, Villa 3" },
    items: [{ productId: "fp4", productName: "Pearl White Lilies", quantity: 3, price: 78.000 }],
    subtotal: 234.000, deliveryFee: 0, total: 234.000, status: "delivered", paymentMethod: "cash",
    notes: "Graduation ceremony", createdAt: dateOn(2024, 11, 5, 11, 0), updatedAt: dateOn(2024, 11, 5, 15, 30),
  },
  {
    id: "17", orderNumber: "HV-1017",
    customer: { name: "Huda Al-Sheikh", email: "huda@email.com", phone: "+965 5574 0017", address: "Bayan, Block 5, St 3, Villa 18" },
    items: [{ productId: "bs3", productName: "Tulip Paradise", quantity: 2, price: 48.000 }, { productId: "bs1", productName: "Classic Red Rose Box", quantity: 1, price: 55.000 }],
    subtotal: 151.000, deliveryFee: 3.000, total: 154.000, status: "delivered", paymentMethod: "cash",
    createdAt: dateOn(2024, 12, 28, 16, 0), updatedAt: dateOn(2024, 12, 28, 20, 15),
  },
  {
    id: "18", orderNumber: "HV-1018",
    customer: { name: "Bader Al-Rashidi", email: "bader@email.com", phone: "+965 5575 0018", address: "Salwa, Block 2, St 10, Tower 5" },
    items: [{ productId: "fp1", productName: "Royal Rose Symphony", quantity: 5, price: 69.900 }],
    subtotal: 349.500, deliveryFee: 0, total: 349.500, status: "delivered", paymentMethod: "cash",
    notes: "Corporate event — 5 identical arrangements", createdAt: dateOn(2025, 1, 18, 8, 30), updatedAt: dateOn(2025, 1, 18, 13, 0),
  },
  {
    id: "19", orderNumber: "HV-1019",
    customer: { name: "Noura Al-Wazzan", email: "noura@email.com", phone: "+965 5576 0019", address: "Rumaithiya, Block 3, St 5, Villa 27" },
    items: [{ productId: "bs4", productName: "Luxury White & Gold", quantity: 1, price: 89.900 }, { productId: "fp3", productName: "Midnight Orchid Elegance", quantity: 1, price: 99.900 }],
    subtotal: 189.800, deliveryFee: 0, total: 189.800, status: "delivered", paymentMethod: "cash",
    createdAt: dateOn(2025, 4, 7, 12, 15), updatedAt: dateOn(2025, 4, 7, 17, 45),
  },
  {
    id: "20", orderNumber: "HV-1020",
    customer: { name: "Abdullah Al-Hajri", email: "abdullah@email.com", phone: "+965 5577 0020", address: "Al Nuzha, Block 1, St 9, Bldg 11" },
    items: [{ productId: "fp2", productName: "Golden Hour Bouquet", quantity: 1, price: 62.000 }],
    subtotal: 62.000, deliveryFee: 3.000, total: 65.000, status: "delivered", paymentMethod: "cash",
    createdAt: dateOn(2025, 4, 20, 10, 0), updatedAt: dateOn(2025, 4, 20, 14, 30),
  },
  {
    id: "21", orderNumber: "HV-1021",
    customer: { name: "Zainab Al-Mousawi", email: "zainab@email.com", phone: "+965 5578 0021", address: "Kaifan, Block 4, St 6, Villa 31" },
    items: [{ productId: "fp4", productName: "Pearl White Lilies", quantity: 2, price: 78.000 }, { productId: "bs3", productName: "Tulip Paradise", quantity: 1, price: 48.000 }],
    subtotal: 204.000, deliveryFee: 0, total: 204.000, status: "delivered", paymentMethod: "cash",
    notes: "Mother's Day special", createdAt: dateOn(2025, 7, 14, 9, 0), updatedAt: dateOn(2025, 7, 14, 13, 0),
  },
  {
    id: "22", orderNumber: "HV-1022",
    customer: { name: "Majed Al-Enezi", email: "majed@email.com", phone: "+965 5579 0022", address: "Farwaniya, Block 2, St 8, Bldg 6" },
    items: [{ productId: "bs1", productName: "Classic Red Rose Box", quantity: 2, price: 55.000 }],
    subtotal: 110.000, deliveryFee: 3.000, total: 113.000, status: "delivered", paymentMethod: "cash",
    createdAt: dateOn(2025, 9, 3, 15, 30), updatedAt: dateOn(2025, 9, 3, 20, 0),
  },
  {
    id: "23", orderNumber: "HV-1023",
    customer: { name: "Lulwa Al-Ghanim", email: "lulwa@email.com", phone: "+965 5580 0023", address: "Al Bida, Block 3, Tower 9, Apt 14" },
    items: [{ productId: "fp1", productName: "Royal Rose Symphony", quantity: 1, price: 69.900 }, { productId: "bs4", productName: "Luxury White & Gold", quantity: 1, price: 89.900 }],
    subtotal: 159.800, deliveryFee: 0, total: 159.800, status: "cancelled", paymentMethod: "cash",
    notes: "Customer requested cancellation", createdAt: dateOn(2025, 11, 25, 11, 0), updatedAt: dateOn(2025, 11, 25, 14, 0),
  },
  {
    id: "24", orderNumber: "HV-1024",
    customer: { name: "Sultan Al-Azmi", email: "sultan@email.com", phone: "+965 5581 0024", address: "Salmiya, Block 5, St 1, Bldg 20" },
    items: [{ productId: "fp3", productName: "Midnight Orchid Elegance", quantity: 2, price: 99.900 }],
    subtotal: 199.800, deliveryFee: 0, total: 199.800, status: "delivered", paymentMethod: "cash",
    createdAt: dateOn(2025, 12, 31, 10, 0), updatedAt: dateOn(2026, 1, 1, 2, 30),
  },
  {
    id: "25", orderNumber: "HV-1025",
    customer: { name: "Dalal Al-Saqer", email: "dalal@email.com", phone: "+965 5582 0025", address: "Kuwait City, Sharq, Mubarak Al-Kabeer St" },
    items: [{ productId: "fp2", productName: "Golden Hour Bouquet", quantity: 3, price: 62.000 }],
    subtotal: 186.000, deliveryFee: 0, total: 186.000, status: "delivered", paymentMethod: "cash",
    notes: "New Year gala arrangements", createdAt: dateOn(2026, 1, 5, 8, 0), updatedAt: dateOn(2026, 1, 5, 12, 30),
  },
  {
    id: "26", orderNumber: "HV-1026",
    customer: { name: "Jasem Al-Badr", email: "jasem@email.com", phone: "+965 5583 0026", address: "Jabriya, Block 9, St 4, Villa 55" },
    items: [{ productId: "fp4", productName: "Pearl White Lilies", quantity: 1, price: 78.000 }, { productId: "fp1", productName: "Royal Rose Symphony", quantity: 2, price: 69.900 }],
    subtotal: 217.800, deliveryFee: 3.000, total: 220.800, status: "delivered", paymentMethod: "cash",
    createdAt: dateOn(2026, 2, 14, 11, 30), updatedAt: dateOn(2026, 2, 14, 16, 0),
  },
  {
    id: "27", orderNumber: "HV-1027",
    customer: { name: "Wafaa Al-Hashem", email: "wafaa@email.com", phone: "+965 5584 0027", address: "Hawally, Block 10, St 15, House 4" },
    items: [{ productId: "bs4", productName: "Luxury White & Gold", quantity: 2, price: 89.900 }, { productId: "bs3", productName: "Tulip Paradise", quantity: 1, price: 48.000 }],
    subtotal: 227.800, deliveryFee: 0, total: 227.800, status: "delivered", paymentMethod: "cash",
    createdAt: dateOn(2026, 3, 20, 13, 0), updatedAt: dateOn(2026, 3, 20, 17, 30),
  },
];

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Fetch all orders — with optional filters.
 * When API is live, this hits Laravel's paginated endpoint.
 * Otherwise returns mock data with client-side filtering.
 */
export async function fetchOrders(filters?: {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<OrdersListResponse> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
      if (filters?.dateTo) params.set("date_to", filters.dateTo);
      if (filters?.search) params.set("search", filters.search);
      if (filters?.page) params.set("page", String(filters.page));
      if (filters?.perPage) params.set("per_page", String(filters.perPage));

      const qs = params.toString();
      const path = `/admin/orders${qs ? `?${qs}` : ""}`;

      const data = await ordersFetch<LaravelOrdersListResponse>(path);
      return {
        orders: data.data.map(mapLaravelOrder),
        total: data.meta.total,
        currentPage: data.meta.current_page,
        lastPage: data.meta.last_page,
      };
    } catch (err) {
      if (err instanceof OrdersError) throw err;
      // API is configured but call failed — throw instead of silently falling back to mock.
      throw new OrdersError(
        err instanceof Error ? err.message : "Failed to fetch orders",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 200));

  let result = [...MOCK_ORDERS];

  if (filters?.status) {
    result = result.filter((o) => o.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        (o.orderNumber || o.id).toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
    );
  }
  if (filters?.dateFrom) {
    const from = new Date(filters.dateFrom);
    from.setHours(0, 0, 0, 0);
    result = result.filter((o) => new Date(o.createdAt) >= from);
  }
  if (filters?.dateTo) {
    const to = new Date(filters.dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((o) => new Date(o.createdAt) <= to);
  }

  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const page = filters?.page ?? 1;
  const perPage = filters?.perPage ?? 50;
  const start = (page - 1) * perPage;
  const paginated = result.slice(start, start + perPage);

  return {
    orders: paginated,
    total: result.length,
    currentPage: page,
    lastPage: Math.max(1, Math.ceil(result.length / perPage)),
  };
}

/**
 * Fetch a single order by ID.
 */
export async function fetchOrderById(id: string): Promise<Order | null> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await ordersFetch<{ data: LaravelOrder }>(
        `/admin/orders/${id}`
      );
      return mapLaravelOrder(data.data);
    } catch (err) {
      if (err instanceof OrdersError && err.code === "NOT_FOUND") return null;
      if (err instanceof OrdersError) throw err;
      // API is configured but call failed — throw instead of silently falling back.
      throw new OrdersError(
        err instanceof Error ? err.message : "Failed to fetch order",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock ──
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_ORDERS.find((o) => o.id === id || o.orderNumber === id) ?? null;
}

/**
 * Update order status.
 * When API is live, this calls PATCH /admin/orders/:id/status.
 * Otherwise, updates mock data in-memory.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await ordersFetch<{ data: LaravelOrder }>(
        `/admin/orders/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );
      return mapLaravelOrder(data.data);
    } catch (err) {
      if (err instanceof OrdersError) throw err;
      throw new OrdersError(
        err instanceof Error ? err.message : "Failed to update order status",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 300));

  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (!order) {
    throw new OrdersError("Order not found", "NOT_FOUND");
  }

  // Validate status transition
  if (status === "cancelled" && order.status === "delivered") {
    throw new OrdersError(
      "Cannot cancel a delivered order",
      "STATUS_CONFLICT"
    );
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  return { ...order };
}

/**
 * Cancel an order.
 * Convenience method — same as updateOrderStatus(id, "cancelled") but
 * uses a dedicated endpoint for audit logging.
 */
export async function cancelOrder(id: string): Promise<Order> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await ordersFetch<{ data: LaravelOrder }>(
        `/admin/orders/${id}/cancel`,
        { method: "PATCH" }
      );
      return mapLaravelOrder(data.data);
    } catch (err) {
      if (err instanceof OrdersError) throw err;
      throw new OrdersError(
        err instanceof Error ? err.message : "Failed to cancel order",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  return updateOrderStatus(id, "cancelled");
}

/**
 * Delete an order (soft-delete on backend).
 */
export async function deleteOrder(id: string): Promise<boolean> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      await ordersFetch<{ message: string }>(`/admin/orders/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      if (err instanceof OrdersError) throw err;
      throw new OrdersError(
        err instanceof Error ? err.message : "Failed to delete order",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 200));

  const idx = MOCK_ORDERS.findIndex((o) => o.id === id);
  if (idx === -1) {
    throw new OrdersError("Order not found", "NOT_FOUND");
  }
  MOCK_ORDERS.splice(idx, 1);
  return true;
}

/**
 * Fetch order statistics.
 * When API is live, this hits /admin/orders/stats.
 * Otherwise, computed from mock data.
 */
export async function fetchOrderStats(): Promise<OrderStats> {
  // ── Try real API first ──
  if (API_BASE) {
    try {
      const data = await ordersFetch<LaravelOrderStats>(
        "/admin/orders/stats"
      );
      return {
        totalRevenue: data.total_revenue,
        averageOrderValue: data.average_order_value,
        statusCounts: data.status_counts,
      };
    } catch (err) {
      if (err instanceof OrdersError) throw err;
      throw new OrdersError(
        err instanceof Error ? err.message : "Failed to fetch order stats",
        "NETWORK_ERROR"
      );
    }
  }

  // ── Mock (only when API_BASE is not configured) ──
  await new Promise((r) => setTimeout(r, 100));

  const delivered = MOCK_ORDERS.filter((o) => o.status === "delivered");
  const totalRevenue = delivered.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue =
    delivered.length > 0 ? totalRevenue / delivered.length : 0;

  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };
  MOCK_ORDERS.forEach((o) => {
    statusCounts[o.status]++;
  });

  return { totalRevenue, averageOrderValue, statusCounts };
}