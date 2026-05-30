"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AdminTopbar } from "@/components/admin/ui/admin-topbar";
import { AdminSidebar } from "@/components/admin/ui/admin-sidebar";
import { hydrateAllStores } from "@/lib/store-hydration";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    hydrate();
    // Hydrate all persisted stores from localStorage so cached data
    // is available instantly (SWR pattern: show stale, refresh in background)
    hydrateAllStores();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }
    setChecking(false);
  }, [hydrated, user, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="w-8 h-8 border-2 border-maroon/30 border-t-maroon rounded-full animate-spin dark:border-gold/30 dark:border-t-gold" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-light-bg dark:bg-dark-bg overflow-hidden">
      <AdminTopbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}