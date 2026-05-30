"use client";

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  DollarSign,
  Menu,
  X,
  Flower2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";
import { useState, useCallback } from "react";
import { prefetchRoute } from "@/lib/store-hydration";

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
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const nav = dict.admin.nav;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Prefetch data on hover — by the time the user clicks, data is ready
  const handleHoverPrefetch = useCallback((href: string) => {
    // Don't prefetch the current page
    if (href === pathname) return;
    prefetchRoute(href).catch(() => {
      // Silently ignore — prefetch is best-effort
    });
  }, [pathname]);

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  const textCls = collapsed
    ? "max-w-0 opacity-0 overflow-hidden"
    : "max-w-[200px] opacity-100";

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Top row: brand + toggle */}
      <div className="flex items-center justify-between px-3 pt-4 pb-5">
        <div className={`flex items-center min-w-0 ${collapsed ? "justify-center w-full" : "gap-3"}`}>
          <div className="h-9 w-9 rounded-[10px] bg-maroon dark:bg-gold flex items-center justify-center shrink-0">
            <Flower2 className="h-[18px] w-[18px] text-white" />
          </div>
          <div className={`flex flex-col min-w-0 whitespace-nowrap transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${textCls}`}>
            <span className="font-serif text-[15px] font-semibold text-foreground leading-tight tracking-tight">
              Havana
            </span>
            <span className="text-[10px] text-muted-foreground/60 font-medium mt-px">
              Flower Studio
            </span>
          </div>
        </div>

        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted/70 transition-all duration-150 cursor-pointer -mr-1 shrink-0"
          >
            <ToggleIcon className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        <p
          className={`mb-2 text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-[0.1em] whitespace-nowrap transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            collapsed ? "max-w-0 opacity-0 overflow-hidden" : "max-w-[200px] opacity-100 px-3"
          }`}
        >
          Main
        </p>
        <div className="space-y-0.5">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div
                key={item.labelKey}
                className={`relative group ${collapsed ? "flex justify-center" : ""}`}
              >
                <Link
                  href={item.href}
                  onMouseEnter={() => handleHoverPrefetch(item.href)}
                  className={`relative w-full flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    collapsed ? "px-0 py-[9px] justify-center" : "px-3 py-[9px]"
                  } ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-maroon dark:bg-gold" />
                  )}
                  <item.icon
                    className={`h-[17px] w-[17px] shrink-0 transition-colors duration-150 ${
                      isActive
                        ? "text-maroon dark:text-gold"
                        : "text-muted-foreground/50 group-hover:text-muted-foreground"
                    }`}
                  />
                  <span className={`truncate whitespace-nowrap transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${textCls}`}>
                    {nav[item.labelKey]}
                  </span>
                  {!collapsed && isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-maroon/30 dark:bg-gold/30 shrink-0" />
                  )}
                </Link>

                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-md bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 shadow-md">
                    {nav[item.labelKey]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={toggleCollapse}
          className="mx-2 mb-3 mt-1 p-2 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/70 transition-all duration-150 cursor-pointer flex justify-center"
        >
          <ToggleIcon className="h-[18px] w-[18px]" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 flex items-center justify-center h-11 w-11 rounded-full bg-maroon dark:bg-gold text-white shadow-lg shadow-maroon/20 dark:shadow-gold/20 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-dark-card border-r border-border transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[10px] bg-maroon dark:bg-gold flex items-center justify-center">
              <Flower2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-serif text-[15px] font-semibold text-foreground">Havana</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="p-3 space-y-0.5">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.labelKey}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                onMouseEnter={() => handleHoverPrefetch(item.href)}
                className={`relative w-full flex items-center gap-3 px-3 py-[11px] rounded-lg text-[14px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-maroon/8 dark:bg-gold/10 text-maroon dark:text-gold"
                    : "text-muted-foreground hover:text-foreground active:bg-muted"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-maroon dark:bg-gold" />
                )}
                <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "" : "text-muted-foreground/50"}`} />
                <span>{nav[item.labelKey]}</span>
              </Link>
            );
          })}
        </nav>


      </aside>

      {/* Desktop sidebar */}
      <aside
        onClick={collapsed ? toggleCollapse : undefined}
        className={`hidden lg:flex flex-col h-full bg-white dark:bg-dark-card border-r border-border shrink-0 shadow-sidebar transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${
          collapsed ? "w-[68px] cursor-pointer" : "w-[240px]"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}