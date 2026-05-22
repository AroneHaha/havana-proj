"use client";

import { usePathname } from "next/navigation";
import { SiteChrome } from "@/components/layout/site-chrome";

const adminPaths = ["/dashboard", "/orders", "/sales-reviews", "/products"];

export default function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

  if (isAdmin) return <>{children}</>;
  return <SiteChrome>{children}</SiteChrome>;
}