/** /frontend/components/reviews/review-search-bar.tsx */
"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

interface ReviewSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ReviewSearchBar({
  value,
  onChange,
  placeholder,
}: ReviewSearchBarProps) {
  const [focused, setFocused] = useState(false);
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale).admin.reviews;
  const resolvedPlaceholder = placeholder ?? t.searchPlaceholder;

  return (
    <div className="relative">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={resolvedPlaceholder}
        className="ps-10 pe-10 h-10 text-sm rounded-xl bg-white dark:bg-dark-card border-border focus-visible:ring-2 focus-visible:ring-maroon dark:focus-visible:ring-gold"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
