"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, ChevronDown, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useUIStore } from "@/store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

const occasionKeys = [
  "eid", "weddings", "birthday", "anniversary",
  "graduation", "mothersDay", "loveRomance", "sympathy",
] as const;

const navKeys = [
  { key: "home" as const, href: "/" },
  { key: "shop" as const, href: "#shop" },
  { key: "categories" as const, href: "#categories" },
  { key: "occasions" as const, href: "#occasions", hasDropdown: true },
  { key: "about" as const, href: "#about" },
  { key: "contact" as const, href: "#contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isOccasionsOpen, setIsOccasionsOpen] = useState(false);
  const openMobileMenu = useUIStore((s) => s.openMobileMenu);
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-maroon text-white text-xs py-2 text-center font-medium tracking-wide">
        <div className="flex items-center justify-center gap-2">
          <Truck className="h-3.5 w-3.5" />
          <span>{t.announcement.text}</span>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background dark:bg-dark-card shadow-lg border-b border-border"
            : "bg-background dark:bg-dark-bg"
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              onClick={openMobileMenu}
              className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl lg:text-3xl font-serif font-bold tracking-wider text-gold-gradient">
                HAVANA
              </span>
              <span className="hidden sm:inline text-[10px] font-medium tracking-[0.3em] text-muted-foreground uppercase mt-1">
                Flowers
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navKeys.map((item) =>
                item.hasDropdown ? (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => setIsOccasionsOpen(true)}
                    onMouseLeave={() => setIsOccasionsOpen(false)}
                  >
                    <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-maroon dark:hover:text-gold transition-colors rounded-lg hover:bg-muted cursor-pointer">
                      {t.nav[item.key]}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <AnimatePresence>
                      {isOccasionsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-border bg-card shadow-xl p-2"
                        >
                          {occasionKeys.map((occ) => (
                            <span
                              key={occ}
                              className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-maroon/10 hover:text-maroon dark:hover:bg-gold/10 dark:hover:text-gold transition-colors cursor-default"
                            >
                              {t.occasions[occ]}
                            </span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    key={item.key}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium text-foreground hover:text-maroon dark:hover:text-gold transition-colors rounded-lg hover:bg-muted"
                  >
                    {t.nav[item.key]}
                  </a>
                )
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />

              {/* REMOVED: Search button */}

              {/* User */}
              <a
                href="/login"
                className="hidden sm:flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
              >
                <User className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* REMOVED: Expandable Search Bar */}

      </header>
    </>
  );
}