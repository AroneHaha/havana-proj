"use client";

import { Flower2, Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

export function AdminTopbar() {
  const router = useRouter();
  const locale = useLanguageStore((s) => s.locale);
  const dict = getDictionary(locale);
  const nav = dict.admin.nav;

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-dark-card/90 backdrop-blur-md border-b border-border shadow-topbar">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-maroon/8 dark:bg-gold/10 border border-maroon/10 dark:border-gold/15">
            <Flower2 className="h-5 w-5 text-maroon dark:text-gold" />
          </div>
          <span className="font-serif text-lg font-semibold text-foreground">Havana</span>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-medium border border-border shadow-xs">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-muted hover:shadow-xs transition-all duration-200 cursor-pointer group">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-maroon dark:bg-gold ring-2 ring-white dark:ring-dark-card shadow-xs" />
          </button>
          <div className="flex items-center gap-2.5 pl-3 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-maroon to-maroon-light dark:from-gold dark:to-gold-light flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 hover:shadow-xs transition-all duration-200 cursor-pointer group" title={nav.signOut}>
              <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
