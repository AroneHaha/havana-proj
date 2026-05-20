"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, User, Heart, Package, Settings, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUIStore, useCartStore, useWishlistStore } from "../../store";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const occasions = [
  "Eid", "Weddings", "Birthday", "Anniversary",
  "Graduation", "Mother's Day", "Love & Romance", "Sympathy",
];

const accountLinks = [
  { label: "Sign In", icon: User, href: "/login" },
  { label: "My Orders", icon: Package, href: "#" },
  { label: "Wishlist", icon: Heart, href: "#" },
  { label: "Settings", icon: Settings, href: "#" },
];

export function MobileNav() {
  const isMobileMenuOpen = useUIStore((s: any) => s.isMobileMenuOpen);
  const closeMobileMenu = useUIStore((s: any) => s.closeMobileMenu);
  const openCart = useUIStore((s: any) => s.openCart);
  const cartCount = useCartStore((s: any) => s.getItemCount());
  const wishlistCount = useWishlistStore((s: any) => s.getItemCount());

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
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-card shadow-2xl overflow-y-auto"
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search flowers..." className="pl-10 rounded-xl" />
              </div>
            </div>

            {/* Nav Links */}
            <div className="py-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-6 py-3 text-base font-medium text-foreground hover:bg-muted hover:text-maroon dark:hover:text-gold transition-colors"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>

            {/* Occasions Grid */}
            <div className="p-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Occasions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {occasions.map((occ) => (
                  <a
                    key={occ}
                    href="#occasions"
                    onClick={closeMobileMenu}
                    className="rounded-lg border border-border p-3 text-center text-sm font-medium text-foreground hover:border-maroon hover:text-maroon dark:hover:border-gold dark:hover:text-gold transition-colors"
                  >
                    {occ}
                  </a>
                ))}
              </div>
            </div>

            {/* Account Links */}
            <div className="p-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Account
              </h3>
              <div className="space-y-1">
                {accountLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted hover:text-maroon dark:hover:text-gold transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                    {link.label === "Wishlist" && wishlistCount > 0 && (
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
                Cart
                {cartCount > 0 && (
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
