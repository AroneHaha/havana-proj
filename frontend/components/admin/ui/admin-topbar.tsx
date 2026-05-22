"use client";

import { Bell, Flower2, LogOut } from "lucide-react";

interface AdminTopbarProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  handleLogout: () => void;
  signOutLabel?: string;
}

export default function AdminTopbar({
  user,
  handleLogout,
  signOutLabel = "Sign Out",
}: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <Flower2 className="h-6 w-6 text-maroon dark:text-gold" />

          <span className="font-serif text-lg font-semibold text-foreground">
            Havana
          </span>

          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <Bell className="h-5 w-5 text-muted-foreground" />

            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-maroon dark:bg-gold" />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-maroon dark:bg-gold flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-none">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              title={signOutLabel}
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}