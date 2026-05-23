"use client";

import { X } from "lucide-react";

interface DateRangeBarProps {
  dateFrom: string;
  dateTo: string;
  activePreset: "today" | "7d" | "30d" | null;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onPresetChange: (preset: "today" | "7d" | "30d") => void;
  onClear: () => void;
  labels?: {
    today?: string;
    last7Days?: string;
    last30Days?: string;
    custom?: string;
  };
}

export function DateRangeBar({
  dateFrom,
  dateTo,
  activePreset,
  onDateFromChange,
  onDateToChange,
  onPresetChange,
  onClear,
  labels = {},
}: DateRangeBarProps) {
  const hasDateFilter = dateFrom || dateTo;

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30 gap-3 flex-wrap">
      <div className="flex items-center gap-1.5">
        {([
          { key: "today" as const, label: labels.today ?? "Today" },
          { key: "7d" as const, label: labels.last7Days ?? "Last 7 Days" },
          { key: "30d" as const, label: labels.last30Days ?? "Last 30 Days" },
        ]).map((preset) => (
          <button
            key={preset.key}
            onClick={() => onPresetChange(preset.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activePreset === preset.key
                ? "bg-maroon text-white dark:bg-gold dark:text-dark-bg"
                : "bg-white dark:bg-dark-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {preset.label}
          </button>
        ))}
        {hasDateFilter && !activePreset && (
          <span className="text-xs text-muted-foreground px-1">{labels.custom ?? "Custom"}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow"
        />
        <span className="text-xs text-muted-foreground">&rarr;</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-border bg-white dark:bg-dark-bg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-gold transition-shadow"
        />
        {hasDateFilter && (
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}