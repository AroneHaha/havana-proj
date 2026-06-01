"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Disable all buttons while a fetch is in progress */
  disabled?: boolean;
  showingCount?: number;
  totalCount?: number;
  labels?: {
    showing?: string;
    page?: string;
  };
}

/**
 * Generate the page numbers to display in the pagination bar.
 * Always shows first and last page, with the current page and its
 * neighbors. Uses ellipsis (...) when there are gaps.
 *
 * Examples:
 *   total=3  → [1, 2, 3]
 *   total=7  → [1, 2, 3, 4, 5, 6, 7]
 *   total=10, current=1  → [1, 2, 3, ..., 10]
 *   total=10, current=5  → [1, ..., 4, 5, 6, ..., 10]
 *   total=10, current=10 → [1, ..., 8, 9, 10]
 */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // Always include first page
  pages.push(1);

  // Determine the range around the current page
  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);

  // Add ellipsis before the range if needed
  if (rangeStart > 2) {
    pages.push("...");
  }

  // Add the range of pages around current
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis after the range if needed
  if (rangeEnd < total - 1) {
    pages.push("...");
  }

  // Always include last page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showingCount,
  totalCount,
  labels = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-inset">
      {showingCount !== undefined && totalCount !== undefined && (
        <p className="text-xs text-muted-foreground">
          {(labels.showing ?? "Showing {count} of {total}")
            .replace("{count}", String(showingCount))
            .replace("{total}", String(totalCount))}
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer shadow-xs hover:shadow-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-xs text-muted-foreground select-none"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={disabled}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                page === currentPage
                  ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg shadow-sm"
                  : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground shadow-xs hover:shadow-none"
              } disabled:opacity-40 disabled:pointer-events-none`}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer shadow-xs hover:shadow-none"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
