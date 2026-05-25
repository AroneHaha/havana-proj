import type { OrderStatus } from "@/store/orders-store";
import { ORDER_STATUS_COLORS, ORDER_STATUS_DOT_COLORS, ORDER_FILTER_TABS, DEFAULT_ITEMS_PER_PAGE } from "@/lib/constant";

// Re-export from canonical source
export const statusColors = ORDER_STATUS_COLORS;
export const statusDotColors = ORDER_STATUS_DOT_COLORS;
export const FILTER_TABS = ORDER_FILTER_TABS;
export const ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE;

export type FilterStatus = "all" | OrderStatus;
