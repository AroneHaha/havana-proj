"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showingCount?: number;
  totalCount?: number;
  labels?: {
    showing?: string;
    page?: string;
  };
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showingCount,
  totalCount,
  labels = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-inset">
      {showingCount !== undefined && totalCount !== undefined && (
        <p className="text-xs text-muted-foreground">
          {(labels.showing ?? "Showing {count} of {total}")
            .replace("{count}", String(showingCount))
            .replace("{total}", String(totalCount))}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer shadow-xs hover:shadow-none hover:border-border"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-xs text-muted-foreground px-2 font-medium">
          {(labels.page ?? "Page {current} of {total}")
            .replace("{current}", String(currentPage))
            .replace("{total}", String(totalPages))}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer shadow-xs hover:shadow-none hover:border-border"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}