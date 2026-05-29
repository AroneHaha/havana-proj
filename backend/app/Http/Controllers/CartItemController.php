<?php

namespace App\Http\Controllers;

use App\Http\Concerns\RespondsTrait;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CartItemController — Add, update, and remove individual cart items.
 *
 * Each cart item belongs to the authenticated user and references a product.
 * Quantity is validated against product stock.
 * Subtotals are calculated using bcmul for KWD 3-decimal precision.
 */
class CartItemController extends Controller
{
    use RespondsTrait;

    /**
     * POST /api/cart/items
     * Add a product to the cart (or increment quantity if already exists).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (!$product->isInStock()) {
            return $this->respondError('Product is out of stock', 422);
        }

        if ($product->stock < $validated['quantity']) {
            return $this->respondError("Only {$product->stock} items available in stock", 422);
        }

        // Check if product already in cart — increment quantity
        $existingItem = $request->user()
            ->cartItems()
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existingItem) {
            $newQuantity = $existingItem->quantity + $validated['quantity'];

            if ($product->stock < $newQuantity) {
                return $this->respondError("Only {$product->stock} items available. You already have {$existingItem->quantity} in your cart.", 422);
            }

            $existingItem->update(['quantity' => $newQuantity]);
            $existingItem->load('product.category');

            return $this->respondWithData(new CartItemResource($existingItem), 'Cart item updated');
        }

        $cartItem = $request->user()->cartItems()->create([
            'product_id' => $validated['product_id'],
            'quantity' => $validated['quantity'],
        ]);
        $cartItem->load('product.category');

        return $this->respondCreated(new CartItemResource($cartItem), 'Item added to cart');
    }

    /**
     * PATCH /api/cart/items/{cartItem}
     * Update the quantity of a cart item.
     */
    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        // Ensure the cart item belongs to the authenticated user
        if ($cartItem->user_id !== $request->user()->id) {
            return $this->respondForbidden('This cart item does not belong to you');
        }

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = $cartItem->product;

        if ($product->stock < $validated['quantity']) {
            return $this->respondError("Only {$product->stock} items available in stock", 422);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);
        $cartItem->load('product.category');

        return $this->respondWithData(new CartItemResource($cartItem), 'Cart item updated');
    }

    /**
     * DELETE /api/cart/items/{cartItem}
     * Remove an item from the cart.
     */
    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return $this->respondForbidden('This cart item does not belong to you');
        }

        $cartItem->delete();

        return $this->respondWithMessage('Item removed from cart');
    }
}
