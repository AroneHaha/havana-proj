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
        $query = Notification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->integer('per_page', 15);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Get unread notification count.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['data' => ['unread_count' => $count]]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        $notification = Notification::where('id', $notification)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['data' => $notification]);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    /**
     * Delete all read notifications for the authenticated user.
     */
    public function deleteRead(Request $request): JsonResponse
    {
        $deleted = Notification::where('user_id', $request->user()->id)
            ->where('is_read', true)
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
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $notification->delete();

        return response()->json(['message' => 'Notification deleted.']);
    }
}