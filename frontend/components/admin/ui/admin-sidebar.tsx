"use client";

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  DollarSign,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { useState } from "react";

const sidebarItems = [
  {
    icon: LayoutDashboard,
    labelKey: "dashboard" as const,
    href: "/dashboard",
  },
  {
    icon: ShoppingBag,
    labelKey: "orders" as const,
    href: "/orders",
  },
  {
    icon: Package,
    labelKey: "productsReviews" as const,
    href: "/products",
  },
  {
    icon: DollarSign,
    labelKey: "sales" as const,
    href: "/sales-reviews",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const nav = dict.admin.nav;
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sidebarContent = (
    <>
      {/* Brand header in sidebar */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 px-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-maroon to-maroon-light dark:from-gold dark:to-gold-light flex items-center justify-center shadow-sm">
            <Package className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-serif text-base font-semibold text-foreground block leading-tight">Havana</span>
            <span className="text-[10px] text-muted-foreground font-medium">Flower Admin</span>
          </div>
        </div>
      </div>

      {/* Section label */}
      <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{nav.dashboard ? "Navigation" : "Menu"}</p>

      <nav className="space-y-1 px-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.labelKey}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-maroon/10 to-maroon/5 dark:from-gold/10 dark:to-gold/5 text-maroon dark:text-gold shadow-sm border border-maroon/15 dark:border-gold/15"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border/50"
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] ${isActive ? "" : "opacity-70"}`} />
              <span className="flex-1">{nav[item.labelKey]}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-maroon dark:bg-gold" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 cursor-pointer"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {nav.signOut}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 flex items-center justify-center h-12 w-12 rounded-full bg-maroon dark:bg-gold text-white shadow-lg shadow-maroon/25 dark:shadow-gold/25 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-card border-r border-border p-4 flex flex-col transition-transform duration-300 shadow-drawer shadow-elevated ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1">{sidebarContent}</div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 h-full bg-white dark:bg-dark-card border-r border-border p-4 shrink-0 shadow-sidebar">
        {sidebarContent}
      </aside>
    </>
  );
}