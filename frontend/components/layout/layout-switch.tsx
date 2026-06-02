"use client";

import { usePathname } from "next/navigation";
import { SiteChrome } from "@/components/layout/site-chrome";
import { ADMIN_PATHS } from "@/lib/constant";

/**
 * LayoutSwitch — decides which chrome surrounds the current page.
 *
 * - Admin pages:        bare children (admin layout handles its own topbar/sidebar)
 * - Login page:         bare children (login has its own branded layout)
 * - Signup page:        bare children (kept for future, not routed to)
 * - All other pages:    wrapped in SiteChrome (Header, Footer, Cart, etc.)
 */
export default function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAdmin || isAuthPage) return <>{children}</>;
  return <SiteChrome>{children}</SiteChrome>;
}