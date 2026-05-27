import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/i18n";

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  isRTL: () => boolean;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((state) => ({ locale: state.locale === "en" ? "ar" : "en" })),
      isRTL: () => get().locale === "ar",
    }),
    {
      name: "havana-language",
      // Prevent server/client hydration mismatch — rehydrate is called
      // once on mount by the ThemeProvider's useStoreHydration hook.
      skipHydration: true,
    }
  )
);
