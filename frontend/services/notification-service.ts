/**
 * Notification Service — admin notifications with real API.
 */

import { type FieldErrors } from "@/lib/api-config";
import { AppError } from "@/lib/app-error";
import { createServiceFetch } from "@/lib/service-fetch";

export type NotificationType =
  | "order_placed" | "order_cancelled" | "order_delivered"
  | "order_in_transit" | "order_processing" | "low_stock"
  | "new_review" | string;

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  titleEn: string;
  titleAr: string;
  body: string;
  bodyEn: string;
  bodyAr: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export interface NotificationListResponse {
  notifications: AdminNotification[];
  total: number;
  currentPage: number;
  lastPage: number;
}

export class NotificationError extends AppError {
  declare code: "NOT_FOUND" | "VALIDATION_ERROR" | "FORBIDDEN" | "TOKEN_EXPIRED" | "NETWORK_ERROR" | "UNKNOWN";
  constructor(message: string, code: NotificationError["code"], fields: FieldErrors = {}) {
    super(message, code, fields);
    this.name = "NotificationError";
  }
}

interface LaravelNotification {
  id: string; type: string; title: string; title_en: string; title_ar: string;
  body: string; body_en: string; body_ar: string;
  data: Record<string, unknown> | null; is_read: boolean; read_at: string | null; created_at: string;
}

interface LaravelNotificationListResponse {
  data: LaravelNotification[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

function mapLaravelNotification(raw: LaravelNotification): AdminNotification {
  return {
    id: String(raw.id), type: raw.type, title: raw.title,
    titleEn: raw.title_en, titleAr: raw.title_ar,
    body: raw.body, bodyEn: raw.body_en, bodyAr: raw.body_ar,
    data: raw.data, isRead: raw.is_read, readAt: raw.read_at, createdAt: raw.created_at,
  };
}

const notificationsFetch = createServiceFetch(NotificationError, {
  validationCode: "VALIDATION_ERROR",
  tokenExpiredCode: "TOKEN_EXPIRED",
});

export async function fetchNotifications(filters?: NotificationFilters): Promise<NotificationListResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.isRead !== undefined) params.set("is_read", String(filters.isRead));
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters?.dateTo) params.set("date_to", filters.dateTo);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.perPage) params.set("per_page", String(filters.perPage));
    const qs = params.toString();
    const data = await notificationsFetch<LaravelNotificationListResponse>(`/admin/notifications${qs ? `?${qs}` : ""}`);
    return {
      notifications: data.data.map(mapLaravelNotification),
      total: data.meta.total, currentPage: data.meta.current_page, lastPage: data.meta.last_page,
    };
  } catch (err) {
    if (err instanceof NotificationError) throw err;
    throw new NotificationError(err instanceof Error ? err.message : "Failed to fetch notifications", "NETWORK_ERROR");
  }
}

export async function markAsRead(id: string): Promise<AdminNotification> {
  try {
    const data = await notificationsFetch<{ data: LaravelNotification }>(`/admin/notifications/${id}/read`, { method: "PATCH" });
    return mapLaravelNotification(data.data);
  } catch (err) {
    if (err instanceof NotificationError) throw err;
    throw new NotificationError(err instanceof Error ? err.message : "Failed to mark notification as read", "NETWORK_ERROR");
  }
}

export async function markAllAsRead(): Promise<boolean> {
  try {
    await notificationsFetch<{ message: string }>("/admin/notifications/read-all", { method: "POST" });
    return true;
  } catch (err) {
    if (err instanceof NotificationError) throw err;
    throw new NotificationError(err instanceof Error ? err.message : "Failed to mark all as read", "NETWORK_ERROR");
  }
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const response = await notificationsFetch<{ data: { unread_count: number } }>("/admin/notifications/unread-count");
    return response.data.unread_count ?? 0;
  } catch (err) {
    if (err instanceof NotificationError) throw err;
    throw new NotificationError(err instanceof Error ? err.message : "Failed to fetch unread count", "NETWORK_ERROR");
  }
}