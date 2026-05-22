"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/language-store";

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const locale = useLanguageStore((s) => s.locale);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    html.setAttribute("lang", locale);
  }, [locale]);

  return <>{children}</>;
}
