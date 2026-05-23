"use client";

import { Search, X } from "lucide-react";
import { FILTER_TABS, statusDotColors, type FilterStatus } from "./constants";
import type { OrdersT } from "./use-orders-data";

interface OrdersFilterBarProps {
  t: OrdersT;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
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
  onClearSearch,
  activeFilter,
  onFilterChange,
  ordersLength,
  statusCounts,
  getTabLabel,
}: OrdersFilterBarProps) {
  return (
    <>
      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.search}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-white dark:bg-dark-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 pb-1 min-w-max">
          {FILTER_TABS.map((filter) => {
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
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[filter]}`} />
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