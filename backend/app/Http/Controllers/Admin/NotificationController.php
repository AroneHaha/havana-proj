<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin NotificationController — Notification management for admin dashboard.
 *
 * Send individual notifications, broadcast to all users,
 * list all notifications, and delete them.
 */
class NotificationController extends \App\Http\Controllers\Controller
{
    use RespondsTrait;

    /**
     * POST /api/admin/notifications
     * Send a notification to a specific user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'type' => ['required', 'string', 'max:100'],
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['required', 'string', 'max:255'],
            'body_en' => ['required', 'string'],
            'body_ar' => ['required', 'string'],
            'data' => ['nullable', 'array'],
        ]);

        $notification = Notification::create([
            'user_id' => $validated['user_id'],
            'type' => $validated['type'],
            'title_en' => $validated['title_en'],
            'title_ar' => $validated['title_ar'],
            'body_en' => $validated['body_en'],
            'body_ar' => $validated['body_ar'],
            'data' => $validated['data'] ?? null,
            'is_read' => false,
        ]);

        return $this->respondCreated(new NotificationResource($notification), 'Notification sent successfully');
    }

    /**
     * POST /api/admin/notifications/broadcast
     * Send a notification to ALL users.
     */
    public function broadcast(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'max:100'],
            'title_en' => ['required', 'string', 'max:255'],
            'title_ar' => ['required', 'string', 'max:255'],
            'body_en' => ['required', 'string'],
            'body_ar' => ['required', 'string'],
            'data' => ['nullable', 'array'],
        ]);

        // Get all user IDs — broadcasts go to ALL users including admins
        $userIds = User::pluck('id');

        $sentCount = 0;
        foreach ($userIds as $userId) {
            Notification::create([
                'user_id' => $userId,
                'type' => $validated['type'],
                'title_en' => $validated['title_en'],
                'title_ar' => $validated['title_ar'],
                'body_en' => $validated['body_en'],
                'body_ar' => $validated['body_ar'],
                'data' => $validated['data'] ?? null,
                'is_read' => false,
            ]);
            $sentCount++;
        }

        return $this->respondWithData(
            ['sent_count' => $sentCount],
            'Broadcast notification sent successfully'
        );
    }

    /**
     * GET /api/admin/notifications
     * Paginated list of notifications with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Notification::with('user');

        // Filter by type
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        // Filter by read status
        if ($request->has('is_read')) {
            $isRead = filter_var($request->query('is_read'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_read', $isRead);
        }

        // Filter by date range (from)
        if ($dateFrom = $request->query('date_from')) {
            $query->where('created_at', '>=', $dateFrom);
        }

        // Filter by date range (to)
        if ($dateTo = $request->query('date_to')) {
            $query->where('created_at', '<=', $dateTo);
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
     * GET /api/admin/notifications/unread-count
     * Returns the count of unread notifications for the authenticated admin user.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }

    /**
     * PATCH /api/admin/notifications/{notification}/read
     * Mark a single notification as read.
     */
    public function markAsRead(Notification $notification): JsonResponse
    {
        if (! $notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'data' => new NotificationResource($notification),
        ]);
    }

    /**
     * POST /api/admin/notifications/read-all
     * Mark ALL notifications as read for the authenticated admin user.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return $this->respondWithMessage('All notifications marked as read');
    }

    /**
     * DELETE /api/admin/notifications/{notification}
     * Delete a notification.
     */
    public function destroy(Notification $notification): JsonResponse
    {
        $notification->delete();

        return $this->respondWithMessage('Notification deleted successfully');
    }
}