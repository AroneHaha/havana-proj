<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CartController — Manage the authenticated user's shopping cart.
 *
 * The cart is virtual — CartItem rows belong directly to the user.
 * No separate Cart model; the user's cart IS their collection of CartItems.
 */
class CartController extends Controller
{
    use RespondsTrait;

    /**
     * GET /api/cart
     * Get the authenticated user's cart with all items.
     */
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()
            ->cartItems()
            ->with('product.category')
            ->get();

        $subtotal = '0.000';
        foreach ($items as $item) {
            $subtotal = bcadd($subtotal, $item->subtotal(), 3);
        }

        return $this->respondWithData([
            'items' => CartItemResource::collection($items),
            'items_count' => $items->count(),
            'subtotal' => $subtotal,
        ]);
    }

    /**
     * DELETE /api/cart
     * Clear the entire cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $request->user()->cartItems()->delete();

        return $this->respondWithMessage('Cart cleared successfully');
    }
}
