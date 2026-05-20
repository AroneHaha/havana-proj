"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, User, Heart, Package, Settings, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUIStore, useCartStore, useWishlistStore } from "@/store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { useHydrated } from "@/hooks/use-hydrated";

const navKeys = [
  { key: "home" as const, href: "/" },
  { key: "shop" as const, href: "/shop" },
  { key: "categories" as const, href: "/categories" },
  { key: "about" as const, href: "/about" },
  { key: "blog" as const, href: "/blog" },
  { key: "contact" as const, href: "/contact" },
];

const occasionKeys = [
  "eid", "weddings", "birthday", "anniversary",
  "graduation", "mothersDay", "loveRomance", "sympathy",
] as const;

const accountLinkKeys = [
  { key: "signIn" as const, icon: User, href: "/login" },
  { key: "myOrders" as const, icon: Package, href: "#" },
  { key: "wishlist" as const, icon: Heart, href: "#" },
  { key: "settings" as const, icon: Settings, href: "#" },
] as const;

export function MobileNav() {
  const isMobileMenuOpen = useUIStore((s) => s.isMobileMenuOpen);
  const closeMobileMenu = useUIStore((s) => s.closeMobileMenu);
  const openCart = useUIStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getItemCount());
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale);
  const hydrated = useHydrated();

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.div
            initial={{ x: locale === "ar" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: locale === "ar" ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed inset-y-0 z-50 w-full max-w-sm bg-card shadow-2xl overflow-y-auto ${
              locale === "ar" ? "right-0" : "left-0"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-xl font-serif font-bold text-gold-gradient">HAVANA</span>
              <button onClick={closeMobileMenu} className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${locale === "ar" ? "right-3" : "left-3"}`} />
                <Input placeholder={t.search.mobilePlaceholder} className={locale === "ar" ? "pr-10 rounded-xl" : "pl-10 rounded-xl"} />
              </div>
            </div>

            {/* Nav Links */}
            <div className="py-2">
              {navKeys.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-6 py-3 text-base font-medium text-foreground hover:bg-muted hover:text-maroon dark:hover:text-gold transition-colors"
                >
                  {t.nav[link.key]}
                  <ChevronRight className={`h-4 w-4 text-muted-foreground ${locale === "ar" ? "rotate-180" : ""}`} />
                </a>
              ))}
            </div>

            {/* Occasions Grid */}
            <div className="p-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t.mobileNav.occasions}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {occasionKeys.map((occ) => (
                  <a
                    key={occ}
                    href="#occasions"
                    onClick={closeMobileMenu}
                    className="rounded-lg border border-border p-3 text-center text-sm font-medium text-foreground hover:border-maroon hover:text-maroon dark:hover:border-gold dark:hover:text-gold transition-colors"
                  >
                    {t.occasions[occ]}
                  </a>
                ))}
              </div>
            </div>

            {/* Account Links */}
            <div className="p-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t.mobileNav.account}
              </h3>
              <div className="space-y-1">
                {accountLinkKeys.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted hover:text-maroon dark:hover:text-gold transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {t.mobileNav[link.key]}
                    {link.key === "wishlist" && hydrated && wishlistCount > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-[10px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Cart CTA */}
            <div className="p-4 border-t border-border">
              <button
                onClick={() => { closeMobileMenu(); openCart(); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-maroon py-3 text-base font-semibold text-white hover:bg-maroon-light transition-colors cursor-pointer"
              >
                {t.mobileNav.cart}
                {hydrated && cartCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-maroon text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
