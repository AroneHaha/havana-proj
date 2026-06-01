import type { OrderStatus } from "@/types";
import { ORDER_STATUS_COLORS, ORDER_STATUS_DOT_COLORS, ORDER_FILTER_TABS } from "@/lib/constant";
import { ORDERS_PER_PAGE } from "@/store/orders-store";

// Re-export from canonical source
export const statusColors = ORDER_STATUS_COLORS;
export const statusDotColors = ORDER_STATUS_DOT_COLORS;
export const FILTER_TABS = ORDER_FILTER_TABS;
export const ITEMS_PER_PAGE = ORDERS_PER_PAGE;

export type FilterStatus = "all" | OrderStatus;
