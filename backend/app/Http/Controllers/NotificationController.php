<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List all notifications for the authenticated admin user.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Notification::where('notifiable_id', $request->user()->id)
            ->where('notifiable_type', get_class($request->user()))
            ->orderByDesc('created_at');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_read')) {
            $isRead = $request->boolean('is_read');
            $query->where('read_at', $isRead ? '!=' : '=', null);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->integer('per_page', 15);
        $notifications = $query->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Get unread notification count.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::where('notifiable_id', $request->user()->id)
            ->where('notifiable_type', get_class($request->user()))
            ->whereNull('read_at')
            ->count();

        return response()->json(['data' => ['unread_count' => $count]]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        $notification = Notification::where('id', $notification)
            ->where('notifiable_id', $request->user()->id)
            ->where('notifiable_type', get_class($request->user()))
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json(['data' => $notification]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('notifiable_id', $request->user()->id)
            ->where('notifiable_type', get_class($request->user()))
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    /**
     * Delete all read notifications for the authenticated user.
     */
    public function deleteRead(Request $request): JsonResponse
    {
        $deleted = Notification::where('notifiable_id', $request->user()->id)
            ->where('notifiable_type', get_class($request->user()))
            ->whereNotNull('read_at')
            ->delete();

        return response()->json([
            'message' => "{$deleted} read notification(s) deleted.",
        ]);
    }
      /**
     * Delete a single notification.
     */
    public function destroy(Request $request, string $notification): JsonResponse
    {
        $notification = Notification::where('id', $notification)
            ->where('notifiable_id', $request->user()->id)
            ->where('notifiable_type', get_class($request->user()))
            ->firstOrFail();

        $notification->delete();

        return response()->json(['message' => 'Notification deleted.']);
    }
}