"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { CheckoutModal } from "@/components/layout/checkout-modal";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";

/**
 * SiteChrome — wraps public-facing pages with Header, Footer,
 * CartDrawer, CheckoutModal, and MobileNav.
 *
 * Admin routes are already filtered out by LayoutSwitch before
 * reaching this component, so no admin-route check is needed here.
 *
 * Also handles initial hydration of auth, cart & wishlist stores:
 *   1. Rehydrate from localStorage cache (instant, via skipHydration)
 *   2. Fetch from API if user is authenticated (async, overwrites cache)
 *
 * Auth hydration is critical here — without it, the storefront
 * treats all users as logged out (user: null) even if they previously
 * logged in, breaking cart sync, wishlist sync, and checkout.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    // Hydrate auth first — cart/wishlist depend on isAuthenticated()
    hydrateAuth();
    fetchCart();
    fetchWishlist();
  }, [hydrateAuth, fetchCart, fetchWishlist]);

  return (
    <>
      <Header />
      <CartDrawer />
      <CheckoutModal />
      <MobileNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
