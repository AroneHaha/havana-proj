"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification-store";
import { useLanguageStore } from "@/store/language-store";
import type { AdminNotification } from "@/store/notification-store";

// ── Props ───────────────────────────────────────────────────────────────
interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────────────
export function NotificationDropdown({
  open,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locale = useLanguageStore((s) => s.locale);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const loading = useNotificationStore((s) => s.loading);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const storeMarkAsRead = useNotificationStore((s) => s.markAsRead);
  const storeMarkAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  // ── Load notifications when opened ─────────────────────────────────
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // ── Poll unread count every 30s ────────────────────────────────────
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30_000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ── Close on outside click ─────────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    if (open) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClick);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClick);
      };
    }
  }, [open, onClose]);

  // ── Pick localized title/body ──────────────────────────────────────
  function getLocalizedTitle(n: AdminNotification): string {
    if (locale === "ar") return n.titleAr || n.title;
    if (locale === "en") return n.titleEn || n.title;
    return n.title;
  }

  function getLocalizedBody(n: AdminNotification): string {
    if (locale === "ar") return n.bodyAr || n.body;
    if (locale === "en") return n.bodyEn || n.body;
    return n.body;
  }

  // ── Single notification click → mark read + navigate ──────────────
  const handleNotificationClick = useCallback(
    async (notif: AdminNotification) => {
      if (!notif.isRead) {
        try {
          await storeMarkAsRead(notif.id);
        } catch (e) {
          console.error("Failed to mark as read", e);
        }
      }

      onClose();

      const data = notif.data as Record<string, string> | undefined;
      if (
        notif.type === "order_placed" ||
        notif.type === "order_status_updated"
      ) {
        const orderId = data?.order_id ?? "";
        if (window.location.pathname === "/orders") {
          window.location.href = `/orders?open=${orderId}`;
        } else {
          router.push(`/orders?open=${orderId}`);
        }
      } else if (notif.type === "low_stock") {
        router.push("/products");
      }
    },
    [router, onClose, storeMarkAsRead]
  );

  // ── Mark all as read ──────────────────────────────────────────────
  const handleMarkAllRead = useCallback(async () => {
    try {
      await storeMarkAllAsRead();
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  }, [storeMarkAllAsRead]);

  // ── Time ago helper ────────────────────────────────────────────────
  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  // ── Icon helper ───────────────────────────────────────────────────
  function notifIcon(type: string) {
    switch (type) {
      case "order_placed":
      case "order_status_updated":
      case "order_processing":
      case "order_in_transit":
        return "🛒";
      case "order_delivered":
        return "✅";
      case "order_cancelled":
        return "❌";
      case "low_stock":
        return "⚠️";
      case "new_review":
        return "⭐";
      default:
        return "🔔";
    }
  }

  // ── Render ─────────────────────────────────────────────────────────
  if (!open) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Check className="h-3.5 w-3.5 animate-pulse" />
                Clearing…
              </>
            ) : (
              <>
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </>
            )}
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-30" />
            <span>No notifications yet</span>
          </div>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors last:border-b-0 cursor-pointer"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5 shrink-0">
                  {notifIcon(notif.type)}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm truncate",
                        !notif.isRead
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {getLocalizedTitle(notif)}
                    </p>
                    {!notif.isRead && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>

                  {notif.body && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {getLocalizedBody(notif)}
                    </p>
                  )}

                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}