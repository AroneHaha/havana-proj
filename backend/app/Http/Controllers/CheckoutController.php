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
 *   1. GET /verify — validate stock availability before checkout
 *   2. POST /      — place the order (transactional)
 *
 * Supports the web checkout payload format (the blueprint):
 *   POST /api/checkout
 *   {
 *     items: [{ product_id, quantity }],
 *     customer: { name, email, phone, address },
 *     notes: "...",
 *     payment_method: "cash_on_delivery"
 *   }
 *
 * Fallback: if no items sent, reads from server-side DB cart.
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
     * Place an order.
     *
     * Accepts the web checkout payload:
     *   { items, customer: { name, email, phone, address }, notes, payment_method }
     *
     * Fallback: if no 'items' in body, reads from server-side cart (legacy).
     * All prices validated server-side from the product database.
     */
    public function store(Request $request): JsonResponse
    {
        // Web sends items in body; fallback reads from server-side cart
        $hasItems = $request->has('items') && is_array($request->input('items'));

        if ($hasItems) {
            // ── Web / Android flow: items + customer in request body ──
            $validated = $request->validate([
                'items'              => ['required', 'array', 'min:1'],
                'items.*.product_id' => ['required', 'string'],
                'items.*.quantity'   => ['required', 'integer', 'min:1'],
                'customer'           => ['required', 'array'],
                'customer.name'      => ['required', 'string', 'max:255'],
                'customer.email'     => ['nullable', 'email', 'max:255'],
                'customer.phone'     => ['required', 'string', 'max:20'],
                'customer.address'   => ['required', 'string', 'max:1000'],
                'notes'              => ['nullable', 'string', 'max:1000'],
                'payment_method'     => ['required', 'string', 'in:cash_on_delivery'],
            ]);
        } else {
            // ── Legacy flow: flat shipping fields, items from server cart ──
            $validated = $request->validate([
                'shipping_address' => ['required', 'string', 'max:1000'],
                'shipping_phone'   => ['required', 'string', 'max:20'],
                'notes'             => ['nullable', 'string', 'max:1000'],
                'payment_method'    => ['required', 'string', 'in:cash_on_delivery'],
            ]);
        }

        $user = $request->user();

        // ── Resolve items list ──
        if ($hasItems) {
            $cartItems = collect();
            foreach ($validated['items'] as $item) {
                $product = Product::find($item['product_id']);
                if (!$product) {
                    return $this->respondError("Product {$item['product_id']} not found", 422);
                }
                if (!$product->isInStock()) {
                    return $this->respondError("Product {$product->name_en} is out of stock", 422);
                }
                if ($product->stock < $item['quantity']) {
                    return $this->respondError(
                        "Only {$product->stock} items available for {$product->name_en}",
                        422
                    );
                }
                $cartItems->push((object) [
                    'product_id' => $product->id,
                    'quantity'   => $item['quantity'],
                    'product'    => $product,
                ]);
            }
            // Extract customer info from web payload
            $customerName  = $validated['customer']['name'];
            $customerPhone = $validated['customer']['phone'];
            $customerEmail = $validated['customer']['email'] ?? null;
            $shippingAddr  = $validated['customer']['address'];
        } else {
            // Legacy: items from server-side cart
            $cartItems = $user->cartItems()->with('product')->get();
            if ($cartItems->isEmpty()) {
                return $this->respondError('Your cart is empty', 422);
            }
            $customerName  = $user->name ?? 'Customer';
            $customerPhone = $validated['shipping_phone'];
            $customerEmail = $user->email;
            $shippingAddr  = $validated['shipping_address'];
        }

        $notes = $validated['notes'] ?? null;
        $paymentMethod = $validated['payment_method'];

        // ── Create order inside transaction ──
        return DB::transaction(function () use ($user, $cartItems, $customerName, $customerPhone, $customerEmail, $shippingAddr, $notes, $paymentMethod, $hasItems) {
            $subtotal = '0.000';
            $orderItems = [];

            foreach ($cartItems as $item) {
                $product = $item->product;

                if (!$product->isInStock() || $product->stock < $item->quantity) {
                    throw new \Exception("Insufficient stock for {$product->name_en}");
                }

                $price = $product->effectivePrice();
                $lineTotal = bcmul($price, (string) $item->quantity, 3);
                $subtotal = bcadd($subtotal, $lineTotal, 3);

                $orderItems[] = [
                    'product_id'     => $product->id,
                    'product_name'   => $product->name_en,
                    'product_image'  => $product->image,
                    'price'          => $price,
                    'quantity'       => $item->quantity,
                ];

                $product->decrement('stock', $item->quantity);
            }

            $shippingCost = $this->calculateShipping($subtotal);
            $discount = '0.000';
            $total = bcadd(bcadd($subtotal, $shippingCost, 3), $discount, 3);
            $orderNumber = 'HVN-' . strtoupper(Str::random(8));

            $order = Order::create([
                'user_id'          => $user->id,
                'order_number'     => $orderNumber,
                'status'           => 'pending',
                'subtotal'         => $subtotal,
                'shipping_cost'    => $shippingCost,
                'discount'         => $discount,
                'total'            => $total,
                'payment_method'   => $paymentMethod,
                'payment_status'   => 'pending',
                'shipping_address' => $shippingAddr,
                'shipping_phone'   => $customerPhone,
                'notes'            => $notes,
            ]);

            foreach ($orderItems as $itemData) {
                $order->items()->create($itemData);
            }

            $order->statusHistory()->create([
                'status'      => 'pending',
                'changed_by'  => $user->id,
                'note'        => 'Order placed successfully',
                'created_at'  => now(),
            ]);

            // Clear server-side cart only for legacy flow
            if (!$hasItems) {
                $user->cartItems()->delete();
            }

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