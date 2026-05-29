<?php

namespace App\Http\Controllers\Admin;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\Admin\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Admin OrderController — Order management + stats for admin dashboard.
 *
 * All methods are admin-only (enforced by route middleware).
 * Status transitions are validated and recorded in OrderStatusHistory.
 */
class OrderController extends \App\Http\Controllers\Controller
{
    use RespondsTrait;

    /**
     * Valid order status transitions.
     * Maps each status to the statuses it can transition to.
     */
    private const STATUS_TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['preparing', 'cancelled'],
        'preparing' => ['out_for_delivery', 'cancelled'],
        'out_for_delivery' => ['delivered', 'cancelled'],
        'delivered' => [],
        'cancelled' => [],
    ];

    /**
     * Timestamp fields to set per status.
     */
    private const STATUS_TIMESTAMPS = [
        'confirmed' => 'confirmed_at',
        'delivered' => 'delivered_at',
        'cancelled' => 'cancelled_at',
    ];

    /**
     * GET /api/admin/orders/stats
     * Order statistics for the admin dashboard.
     */
    public function stats(): JsonResponse
    {
        $totalRevenue = Order::whereNotIn('status', ['cancelled'])
            ->selectRaw('COALESCE(SUM(total), 0) as total_revenue')
            ->value('total_revenue');

        $averageOrderValue = Order::whereNotIn('status', ['cancelled'])
            ->selectRaw('COALESCE(AVG(total), 0) as average_order_value')
            ->value('average_order_value');

        $statusCounts = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Ensure all expected statuses are present
        $allStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        $statusCounts = array_merge(array_fill_keys($allStatuses, 0), $statusCounts);

        return $this->respondWithStats([
            'total_revenue' => bcmul((string) $totalRevenue, '1', 3),
            'average_order_value' => bcmul((string) $averageOrderValue, '1', 3),
            'status_counts' => $statusCounts,
        ]);
    }

    /**
     * GET /api/admin/orders
     * Paginated order list with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items']);

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Filter by date range (from)
        if ($dateFrom = $request->query('date_from')) {
            $query->where('created_at', '>=', $dateFrom);
        }

        // Filter by date range (to)
        if ($dateTo = $request->query('date_to')) {
            $query->where('created_at', '<=', $dateTo);
        }

        // Search by order number or shipping phone
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'LIKE', "%{$search}%")
                    ->orWhere('shipping_phone', 'LIKE', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('first_name', 'LIKE', "%{$search}%")
                            ->orWhere('last_name', 'LIKE', "%{$search}%")
                            ->orWhere('email', 'LIKE', "%{$search}%");
                    });
            });
        }

        $perPage = (int) ($request->query('per_page', 15));
        $orders = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'from' => $orders->firstItem(),
                'to' => $orders->lastItem(),
            ],
        ]);
    }

    /**
     * GET /api/admin/orders/{order}
     * Single order detail with items, user, and status history.
     */
    public function show(Order $order): JsonResponse
    {
        $order->load(['items', 'user', 'statusHistory.changedByUser']);

        return $this->respondWithData(new OrderResource($order));
    }

    /**
     * PATCH /api/admin/orders/{order}/status
     * Update order status with validation and history tracking.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,preparing,out_for_delivery,delivered,cancelled'],
        ]);

        $newStatus = $validated['status'];
        $currentStatus = $order->status;

        // Validate transition
        if ($currentStatus === $newStatus) {
            return $this->respondError('Order is already in this status', 422);
        }

        $allowedTransitions = self::STATUS_TRANSITIONS[$currentStatus] ?? [];
        if (!in_array($newStatus, $allowedTransitions)) {
            return $this->respondError(
                "Cannot transition order from '{$currentStatus}' to '{$newStatus}'",
                422
            );
        }

        return DB::transaction(function () use ($order, $newStatus, $request) {
            // Update order status
            $updateData = ['status' => $newStatus];

            // Set appropriate timestamp
            if (isset(self::STATUS_TIMESTAMPS[$newStatus])) {
                $timestampField = self::STATUS_TIMESTAMPS[$newStatus];
                $updateData[$timestampField] = now();
            }

            $order->update($updateData);

            // Record in status history
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $newStatus,
                'changed_by' => $request->user()->id,
                'note' => "Status changed to {$newStatus}",
                'created_at' => now(),
            ]);

            $order->load(['items', 'user', 'statusHistory.changedByUser']);

            return $this->respondWithData(new OrderResource($order), 'Order status updated successfully');
        });
    }

    /**
     * PATCH /api/admin/orders/{order}/cancel
     * Dedicated cancel endpoint with audit trail.
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        if ($order->status === 'cancelled') {
            return $this->respondError('Order is already cancelled', 422);
        }

        // Validate that the current status allows cancellation
        $allowedTransitions = self::STATUS_TRANSITIONS[$order->status] ?? [];
        if (!in_array('cancelled', $allowedTransitions)) {
            return $this->respondError(
                "Cannot cancel order in '{$order->status}' status",
                422
            );
        }

        return DB::transaction(function () use ($order, $request) {
            $order->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'cancelled',
                'changed_by' => $request->user()->id,
                'note' => $request->input('note', 'Order cancelled by admin'),
                'created_at' => now(),
            ]);

            $order->load(['items', 'user', 'statusHistory.changedByUser']);

            return $this->respondWithData(new OrderResource($order), 'Order cancelled successfully');
        });
    }

    /**
     * DELETE /api/admin/orders/{order}
     * Soft delete an order.
     */
    public function destroy(Order $order): JsonResponse
    {
        $order->delete();

        return $this->respondWithMessage('Order deleted successfully');
    }
}