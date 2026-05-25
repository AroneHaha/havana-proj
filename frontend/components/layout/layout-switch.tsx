"use client";

import { usePathname } from "next/navigation";
import { SiteChrome } from "@/components/layout/site-chrome";
import { ADMIN_PATHS } from "@/lib/constant";

export default function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (isAdmin) return <>{children}</>;
  return <SiteChrome>{children}</SiteChrome>;
}
