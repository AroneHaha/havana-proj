/**
 * Admin layout — overrides root layout's Header/Footer
 * by rendering only children in a full-screen container.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
