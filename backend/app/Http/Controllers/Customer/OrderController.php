<?php

namespace App\Http\Controllers\Customer;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Customer OrderController — Customer's own order management.
 *
 * All queries are scoped to the authenticated user's orders only.
 * Customers can view their orders and cancel pending/confirmed ones.
 */
class OrderController extends \App\Http\Controllers\Controller
{
    use RespondsTrait;

    /**
     * GET /api/orders
     * Customer's order history (paginated).
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->orders()->with(['items', 'statusHistory']);

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
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
     * GET /api/orders/{order}
     * Single order detail (scoped to user's orders only).
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return $this->respondForbidden('This order does not belong to you');
        }

        $order->load(['items', 'statusHistory']);

        return $this->respondWithData(new OrderResource($order));
    }

    /**
     * POST /api/orders/{order}/cancel
     * Customer cancels their own order (pending or confirmed only).
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return $this->respondForbidden('This order does not belong to you');
        }

        if ($order->status === 'cancelled') {
            return $this->respondError('Order is already cancelled', 422);
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return $this->respondError('Only pending or confirmed orders can be cancelled', 422);
        }

        return DB::transaction(function () use ($order, $request) {
            // Restore stock for each item
            foreach ($order->items as $item) {
                $item->product?->increment('stock', $item->quantity);
            }

            $order->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'cancelled',
                'changed_by' => $request->user()->id,
                'note' => 'Order cancelled by customer',
                'created_at' => now(),
            ]);

            $order->load(['items', 'statusHistory']);

            return $this->respondWithData(new OrderResource($order), 'Order cancelled successfully');
        });
    }
}