"use client";

import { Languages } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const locale = useLanguageStore((s) => s.locale);
  const toggleLocale = useLanguageStore((s) => s.toggleLocale);
  const dict = getDictionary(locale);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      className="relative"
      aria-label={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      <Languages className="h-5 w-5" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold text-maroon dark:text-gold">
        {locale === "en" ? "AR" : "EN"}
      </span>
    </Button>
  );
}