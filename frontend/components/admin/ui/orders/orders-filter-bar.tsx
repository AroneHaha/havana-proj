"use client";

import { SearchInput } from "@/components/admin/ui/shared/search-input";
import { ORDER_STATUS_DOT_COLORS, ORDER_FILTER_TABS } from "@/lib/constant";
import { type FilterStatus } from "./constants";
import type { OrdersT } from "./use-orders-data";

interface OrdersFilterBarProps {
  t: OrdersT;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  ordersLength: number;
  statusCounts: Record<string, number>;
  getTabLabel: (filter: FilterStatus) => string;
}

export function OrdersFilterBar({
  t,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  ordersLength,
  statusCounts,
  getTabLabel,
}: OrdersFilterBarProps) {
  return (
    <>
      {/* Search — uses shared SearchInput */}
      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t.search}
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 pb-1 min-w-max">
          {ORDER_FILTER_TABS.map((filter) => {
            const count = filter === "all" ? ordersLength : statusCounts[filter];
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {filter !== "all" && (
                  <span className={`w-1.5 h-1.5 rounded-full ${ORDER_STATUS_DOT_COLORS[filter]}`} />
                )}
                {getTabLabel(filter)}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? "bg-white/20 dark:bg-dark-bg/20"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
