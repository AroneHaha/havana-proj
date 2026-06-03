/**
 * Notification Store — Zustand store for admin notifications.
 * Ephemeral (no persist). Optimistic mark-as-read with rollback on failure.
 */

import { create } from "zustand";
import {
  fetchNotifications as serviceFetchNotifications,
  markAsRead as serviceMarkAsRead,
  markAllAsRead as serviceMarkAllAsRead,
  fetchUnreadCount as serviceFetchUnreadCount,
  type AdminNotification,
} from "@/services/notification-service";
import { getErrorMessage } from "@/lib/get-error-message";

export type { AdminNotification } from "@/services/notification-service";

interface NotificationState {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const result = await serviceFetchNotifications({ perPage: 15 });
      const unreadCount = result.notifications.filter((n) => !n.isRead).length;
      set({ notifications: result.notifications, unreadCount, loading: false });
    } catch (err) {
      set({ error: getErrorMessage(err, "Failed to fetch notifications"), loading: false });
    }
  },

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    try {
      await serviceMarkAsRead(id);
    } catch (err) {
      set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: false } : n),
        unreadCount: state.unreadCount + 1,
        error: getErrorMessage(err, "Failed to mark notification as read"),
      }));
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    try {
      await serviceMarkAllAsRead();
    } catch (err) {
      const currentNotifications = get().notifications;
      const actualUnread = currentNotifications.filter((n) => !n.isRead).length;
      set({ unreadCount: actualUnread, error: getErrorMessage(err, "Failed to mark all as read") });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await serviceFetchUnreadCount();
      set({ unreadCount: count });
    } catch (err) {
      set({ error: getErrorMessage(err, "Failed to fetch unread count") });
    }
  },
}));