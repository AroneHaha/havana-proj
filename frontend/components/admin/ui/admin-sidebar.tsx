"use client";

import Link from "next/link";
import { LogOut, LucideIcon } from "lucide-react";

interface SidebarItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

interface AdminSidebarProps {
  sidebarItems: SidebarItem[];
  nav: Record<string, string>;
  handleLogout: () => void;
  activePath?: string;
}

export default function AdminSidebar({
  sidebarItems,
  nav,
  handleLogout,
  activePath = "/dashboard",
}: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-4rem)] border-r border-border bg-white dark:bg-dark-card p-4">
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const isActive = item.href === activePath;

          return (
            <Link
              key={item.labelKey}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-maroon/5 dark:bg-gold/10 text-maroon dark:text-gold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />

              {nav[item.labelKey as keyof typeof nav]}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />

          {nav.signOut}
        </button>
      </div>
    </aside>
  );
}