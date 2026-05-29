<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\OrderResource;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * CheckoutController — Convert cart items into an order.
 *
 * Two-step flow:
 *   1. GET /verify — validate stock availability before payment
 *   2. POST /      — place the order (transactional)
 *
 * All price calculations use bcmul/bcadd/bcsub for KWD 3-decimal precision.
 */
class CheckoutController extends Controller
{
    use RespondsTrait;

    /**
     * GET /api/checkout/verify
     * Verify stock availability for cart items before checkout.
     */
    public function verify(Request $request): JsonResponse
    {
        $user = $request->user();
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return $this->respondError('Your cart is empty', 422);
        }

        $issues = [];
        $subtotal = '0.000';
        $allAvailable = true;

        foreach ($cartItems as $item) {
            $product = $item->product;

            if (!$product->is_active) {
                $issues[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name_en,
                    'issue' => 'Product is no longer available',
                ];
                $allAvailable = false;
                continue;
            }

            if ($product->stock < $item->quantity) {
                $issues[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name_en,
                    'requested' => $item->quantity,
                    'available' => $product->stock,
                    'issue' => 'Insufficient stock',
                ];
                $allAvailable = false;
            }

            $lineTotal = bcmul($product->effectivePrice(), (string) $item->quantity, 3);
            $subtotal = bcadd($subtotal, $lineTotal, 3);
        }

        $shippingCost = $this->calculateShipping($subtotal);

        return $this->respondWithData([
            'available' => $allAvailable,
            'issues' => $issues,
            'summary' => [
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => '0.000',
                'total' => bcadd($subtotal, $shippingCost, 3),
                'items_count' => $cartItems->count(),
            ],
        ]);
    }

    /**
     * POST /api/checkout
     * Place an order from the user's cart items.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => ['required', 'string', 'max:1000'],
            'shipping_phone' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', 'string', 'in:cash_on_delivery,card,bank_transfer,knet'],
        ]);

        $user = $request->user();
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return $this->respondError('Your cart is empty', 422);
        }

        return DB::transaction(function () use ($user, $cartItems, $validated) {
            $subtotal = '0.000';
            $orderItems = [];

            // Validate stock and calculate subtotal
            foreach ($cartItems as $item) {
                $product = $item->product;

                if (!$product->isInStock() || $product->stock < $item->quantity) {
                    throw new \Exception("Insufficient stock for {$product->name_en}");
                }

                $price = $product->effectivePrice();
                $lineTotal = bcmul($price, (string) $item->quantity, 3);
                $subtotal = bcadd($subtotal, $lineTotal, 3);

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name_en,
                    'product_image' => $product->image,
                    'price' => $price,
                    'quantity' => $item->quantity,
                ];

                // Decrement stock
                $product->decrement('stock', $item->quantity);
            }

            $shippingCost = $this->calculateShipping($subtotal);
            $discount = '0.000';
            $total = bcadd(bcadd($subtotal, $shippingCost, 3), $discount, 3);

            // Generate unique order number
            $orderNumber = 'HVN-' . strtoupper(Str::random(8));

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cash_on_delivery' ? 'pending' : 'pending',
                'shipping_address' => $validated['shipping_address'],
                'shipping_phone' => $validated['shipping_phone'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create order items
            foreach ($orderItems as $itemData) {
                $order->items()->create($itemData);
            }

            // Record initial status in history
            $order->statusHistory()->create([
                'status' => 'pending',
                'changed_by' => $user->id,
                'note' => 'Order placed successfully',
            ]);

            // Clear cart
            $user->cartItems()->delete();

            $order->load(['items', 'statusHistory']);

            return $this->respondCreated(new OrderResource($order), 'Order placed successfully');
        });
    }

    /**
     * Calculate shipping cost based on subtotal.
     * Free shipping over 10 KWD, otherwise 1.000 KWD.
     */
    private function calculateShipping(string $subtotal): string
    {
        if (bccomp($subtotal, '10.000', 3) >= 0) {
            return '0.000';
        }

        return '1.000';
    }
}
