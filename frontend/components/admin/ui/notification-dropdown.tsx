"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, XCircle, Truck, Package, CheckCircle2,
  AlertTriangle, Star, Bell, Loader2,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useLanguageStore } from "@/store/language-store";
import { useNotificationStore } from "@/store/notification-store";
import { getDictionary } from "@/i18n";
import type { NotificationType } from "@/services/notification-service";

function getNotificationStyle(type: NotificationType) {
  switch (type) {
    case "order_placed":
      return { icon: ShoppingCart, bg: "bg-blue-50 dark:bg-blue-900/20", iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" };
    case "order_cancelled":
      return { icon: XCircle, bg: "bg-red-50 dark:bg-red-900/15", iconBg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500 dark:text-red-400", dot: "bg-red-500" };
    case "order_delivered":
      return { icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-900/15", iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
    case "order_in_transit":
      return { icon: Truck, bg: "bg-amber-50 dark:bg-amber-900/15", iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" };
    case "order_processing":
      return { icon: Package, bg: "bg-violet-50 dark:bg-violet-900/15", iconBg: "bg-violet-100 dark:bg-violet-900/30", iconColor: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500" };
    case "low_stock":
      return { icon: AlertTriangle, bg: "bg-orange-50 dark:bg-orange-900/15", iconBg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-500 dark:text-orange-400", dot: "bg-orange-500" };
    case "new_review":
      return { icon: Star, bg: "bg-yellow-50 dark:bg-yellow-900/15", iconBg: "bg-yellow-100 dark:bg-yellow-900/30", iconColor: "text-yellow-500 dark:text-yellow-400", dot: "bg-yellow-500" };
  }
  return { icon: Bell, bg: "bg-muted/30", iconBg: "bg-muted", iconColor: "text-muted-foreground", dot: "bg-muted-foreground" };
}

function formatRelativeTime(dateStr: string, t: ReturnType<typeof getDictionary>["admin"]["notifications"]): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 1) return t.justNow;
  if (minutes < 60) return t.minutesAgo.replace("{count}", String(minutes));
  if (hours < 24) return t.hoursAgo.replace("{count}", String(hours));
  return t.yesterday;
}

export function NotificationDropdown() {
  const isOpen = useUIStore((s) => s.isNotificationOpen);
  const closeNotification = useUIStore((s) => s.closeNotification);
  const locale = useLanguageStore((s) => s.locale);
  const t = getDictionary(locale).admin.notifications;

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const loading = useNotificationStore((s) => s.loading);
  const storeFetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const storeMarkAsRead = useNotificationStore((s) => s.markAsRead);
  const storeMarkAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) storeFetchNotifications();
  }, [isOpen, storeFetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) closeNotification();
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
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
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <Bell className="h-4.5 w-4.5 text-maroon dark:text-gold" />
              <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-maroon dark:bg-gold text-white dark:text-dark-bg text-[10px] font-bold">{unreadCount}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={() => storeMarkAllAsRead()} className="text-[11px] font-medium text-maroon dark:text-gold hover:underline cursor-pointer">{t.markAllRead}</button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 text-muted-foreground/40 animate-spin" /></div>
            ) : notifications.length === 0 ? (
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
                      className={`flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40 cursor-pointer ${!notification.isRead ? style.bg : ""}`}
                      onClick={() => { if (!notification.isRead) storeMarkAsRead(notification.id); }}
                    >
                      <div className={`shrink-0 h-9 w-9 rounded-xl ${style.iconBg} flex items-center justify-center mt-0.5`}>
                        <Icon className={`h-4.5 w-4.5 ${style.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm leading-snug ${!notification.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>{notification.title}</p>
                          {!notification.isRead && <span className={`shrink-0 h-2 w-2 rounded-full ${style.dot}`} />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{notification.body}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{formatRelativeTime(notification.createdAt, t)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border bg-muted/20 px-5 py-3">
            <button className="w-full text-center text-xs font-medium text-maroon dark:text-gold hover:underline cursor-pointer">{t.viewAll}</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}