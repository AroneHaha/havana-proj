"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  XCircle,
  Truck,
  Package,
  CheckCircle2,
  AlertTriangle,
  Star,
  Bell,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useLanguageStore } from "@/store/language-store";
import { getDictionary } from "@/i18n";

// ─── Notification types ────────────────────────────────────────────────

type NotificationType =
  | "order_placed"
  | "order_cancelled"
  | "order_delivered"
  | "order_in_transit"
  | "order_processing"
  | "low_stock"
  | "new_review"


export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

// ─── Mock data — realistic Havana order notifications ──────────────────

function generateMockNotifications(t: ReturnType<typeof getDictionary>["admin"]["notifications"]): AdminNotification[] {
  const now = Date.now();
  return [
    {
      id: "n1",
      type: "order_placed",
      title: t.orderPlaced,
      description: t.orderPlacedDesc
        .replace("{orderNumber}", "HV-2847")
        .replace("{customer}", "Fatima Al-Sabah"),
      timestamp: new Date(now - 2 * 60 * 1000), // 2 min ago
      read: false,
    },
    {
      id: "n3",
      type: "order_in_transit",
      title: t.orderInTransit,
      description: t.orderInTransitDesc
        .replace("{orderNumber}", "HV-2831"),
      timestamp: new Date(now - 28 * 60 * 1000), // 28 min ago
      read: false,
    },
    {
      id: "n4",
      type: "order_cancelled",
      title: t.orderCancelled,
      description: t.orderCancelledDesc
        .replace("{orderNumber}", "HV-2829")
        .replace("{customer}", "Ahmad Hassan"),
      timestamp: new Date(now - 55 * 60 * 1000), // 55 min ago
      read: false,
    },
    {
      id: "n5",
      type: "low_stock",
      title: t.lowStock,
      description: t.lowStockDesc
        .replace("{product}", "Royal Rose Symphony")
        .replace("{stock}", "3"),
      timestamp: new Date(now - 2 * 60 * 60 * 1000), // 2h ago
      read: true,
    },
    {
      id: "n6",
      type: "new_review",
      title: t.newReview,
      description: t.newReviewDesc
        .replace("{customer}", "Noor Al-Din")
        .replace("{rating}", "5")
        .replace("{product}", "Midnight Orchid"),
      timestamp: new Date(now - 3 * 60 * 60 * 1000), // 3h ago
      read: true,
    },
    {
      id: "n7",
      type: "order_delivered",
      title: t.orderDelivered,
      description: t.orderDeliveredDesc
        .replace("{orderNumber}", "HV-2815"),
      timestamp: new Date(now - 5 * 60 * 60 * 1000), // 5h ago
      read: true,
    },
    {
      id: "n8",
      type: "order_processing",
      title: t.orderProcessing,
      description: t.orderProcessingDesc
        .replace("{orderNumber}", "HV-2843"),
      timestamp: new Date(now - 6 * 60 * 60 * 1000), // 6h ago
      read: true,
    },
    {
      id: "n9",
      type: "order_placed",
      title: t.orderPlaced,
      description: t.orderPlacedDesc
        .replace("{orderNumber}", "HV-2840")
        .replace("{customer}", "Sara Al-Mutairi"),
      timestamp: new Date(now - 8 * 60 * 60 * 1000), // 8h ago
      read: true,
    },
    {
      id: "n10",
      type: "low_stock",
      title: t.lowStock,
      description: t.lowStockDesc
        .replace("{product}", "Desert Bloom Bouquet")
        .replace("{stock}", "2"),
      timestamp: new Date(now - 24 * 60 * 60 * 1000), // yesterday
      read: true,
    },
  ];
}

// ─── Icon + color mapping per type ─────────────────────────────────────

function getNotificationStyle(type: NotificationType) {
  switch (type) {
    case "order_placed":
      return {
        icon: ShoppingCart,
        bg: "bg-blue-50 dark:bg-blue-900/20",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        dot: "bg-blue-500",
      };
    case "order_cancelled":
      return {
        icon: XCircle,
        bg: "bg-red-50 dark:bg-red-900/15",
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-500 dark:text-red-400",
        dot: "bg-red-500",
      };
    case "order_delivered":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-50 dark:bg-emerald-900/15",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
      };
    case "order_in_transit":
      return {
        icon: Truck,
        bg: "bg-amber-50 dark:bg-amber-900/15",
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
      };
    case "order_processing":
      return {
        icon: Package,
        bg: "bg-violet-50 dark:bg-violet-900/15",
        iconBg: "bg-violet-100 dark:bg-violet-900/30",
        iconColor: "text-violet-600 dark:text-violet-400",
        dot: "bg-violet-500",
      };
    case "low_stock":
      return {
        icon: AlertTriangle,
        bg: "bg-orange-50 dark:bg-orange-900/15",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-500 dark:text-orange-400",
        dot: "bg-orange-500",
      };
    case "new_review":
      return {
        icon: Star,
        bg: "bg-yellow-50 dark:bg-yellow-900/15",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-500 dark:text-yellow-400",
        dot: "bg-yellow-500",
      };
  }
  // Default fallback (should never reach here)
  return {
    icon: Bell,
    bg: "bg-muted/30",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    dot: "bg-muted-foreground",
  };
}

// ─── Relative time formatting ──────────────────────────────────────────

function formatRelativeTime(date: Date, t: ReturnType<typeof getDictionary>["admin"]["notifications"]): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return t.justNow;
  if (minutes < 60) return t.minutesAgo.replace("{count}", String(minutes));
  if (hours < 24) return t.hoursAgo.replace("{count}", String(hours));
  return t.yesterday;
}

// ─── Component ─────────────────────────────────────────────────────────

export function NotificationDropdown() {
  const isOpen = useUIStore((s) => s.isNotificationOpen);
  const closeNotification = useUIStore((s) => s.closeNotification);
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale).admin.notifications;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifications = generateMockNotifications(t);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeNotification();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeNotification]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-full mt-2 w-[380px] bg-white dark:bg-dark-card rounded-2xl border border-border shadow-2xl ring-1 ring-black/[0.03] dark:ring-white/[0.03] overflow-hidden z-50"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <Bell className="h-4.5 w-4.5 text-maroon dark:text-gold" />
              <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-maroon dark:bg-gold text-white dark:text-dark-bg text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  // In production, this would call a markAllRead API
                  // For now it's a no-op placeholder
                }}
                className="text-[11px] font-medium text-maroon dark:text-gold hover:underline cursor-pointer"
              >
                {t.markAllRead}
              </button>
            )}
          </div>

          {/* ── Scrollable notification list ── */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">{t.noNotifications}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  const Icon = style.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40 cursor-pointer ${
                        !notification.read ? style.bg : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className={`shrink-0 h-9 w-9 rounded-xl ${style.iconBg} flex items-center justify-center mt-0.5`}>
                        <Icon className={`h-4.5 w-4.5 ${style.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm leading-snug ${!notification.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className={`shrink-0 h-2 w-2 rounded-full ${style.dot}`} />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatRelativeTime(notification.timestamp, t)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-border bg-muted/20 px-5 py-3">
            <button className="w-full text-center text-xs font-medium text-maroon dark:text-gold hover:underline cursor-pointer">
              View all notifications
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
