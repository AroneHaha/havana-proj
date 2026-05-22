/** /frontend/components/reviews/review-search-bar.tsx */
"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ReviewSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ReviewSearchBar({
  value,
  onChange,
  placeholder = "Search reviews by keyword, customer, or product...",
}: ReviewSearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="pl-10 pr-10 h-10 text-sm rounded-xl bg-white dark:bg-dark-card border-border focus-visible:ring-2 focus-visible:ring-maroon dark:focus-visible:ring-gold"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}