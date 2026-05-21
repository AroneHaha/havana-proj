/**
 * Site layout — just renders children.
 *
 * Header, Footer, CartDrawer, and MobileNav are handled by
 * SiteChrome in the root layout, which conditionally shows/hides
 * them based on the current route.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
