<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * NotificationController — Customer notification management.
 *
 * Authenticated users (both admin and customer) can view their notifications,
 * mark them as read, and check unread counts.
 * Used primarily by the Android customer app.
 */
class NotificationController extends Controller
{
    use RespondsTrait;

    /**
     * GET /api/notifications
     * List the authenticated user's notifications (paginated).
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->notifications();

        // Filter by unread only
        if (filter_var($request->query('unread_only'), FILTER_VALIDATE_BOOLEAN)) {
            $query->where('is_read', false);
        }

        // Filter by type
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $perPage = (int) ($request->query('per_page', 15));
        $notifications = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => NotificationResource::collection($notifications->items()),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'from' => $notifications->firstItem(),
                'to' => $notifications->lastItem(),
            ],
        ]);
    }

    /**
     * PATCH /api/notifications/{notification}/read
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->respondForbidden('This notification does not belong to you');
        }

        if (!$notification->is_read) {
            $notification->markAsRead();
        }

        return $this->respondWithData(new NotificationResource($notification));
    }

    /**
     * POST /api/notifications/read-all
     * Mark all of the user's notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->notifications()
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return $this->respondWithMessage('All notifications marked as read');
    }

    /**
     * GET /api/notifications/unread-count
     * Get the count of unread notifications.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->notifications()
            ->where('is_read', false)
            ->count();

        return $this->respondWithData(['unread_count' => $count]);
    }
}
