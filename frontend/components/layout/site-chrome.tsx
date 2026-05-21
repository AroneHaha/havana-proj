"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { MobileNav } from "@/components/layout/mobile-nav";

/** Admin routes that should NOT show landing page chrome */
const ADMIN_ROUTES = ["/dashboard", "/orders"];

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/**
 * SiteChrome — conditionally wraps public-facing pages with
 * Header, Footer, CartDrawer, and MobileNav.
 *
 * Admin routes (dashboard, orders, etc.) get none of this chrome.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

  if (isAdmin) {
    return <>{children}</>;
  }

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
