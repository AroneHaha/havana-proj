"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";

/**
 * SiteChrome — wraps public-facing pages with Header, Footer,
 * CartDrawer, and MobileNav.
 *
 * Admin routes are already filtered out by LayoutSwitch before
 * reaching this component, so no admin-route check is needed here.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <CartDrawer />
      <MobileNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
