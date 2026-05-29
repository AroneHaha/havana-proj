<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ReviewController as CustomerReviewController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Customer Routes — Authenticated customer actions
|--------------------------------------------------------------------------
|
| These routes require a valid Sanctum token (auth:sanctum middleware).
| Both admin and customer users can access these, but they are primarily
| designed for the Android customer app experience.
|
| Grouped by domain:
|   - Cart     → cart-service.ts (verified in web frontend)
|   - Checkout → checkout-service.ts (verified in web frontend)
|   - Orders   → Android customer app (not yet in web frontend)
|   - Reviews  → Android customer app (not yet in web frontend)
|   - Addresses → Android customer app (not yet in web frontend)
|   - Notifications → Android customer app (not yet in web frontend)
|
*/

Route::middleware('auth:sanctum')->group(function () {

    // ═══════════════════════════════════════════════════════════════════
    // CART — from cart-service.ts (✅ Web frontend verified)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('cart')->group(function () {
        // GET /api/cart — user's cart with items
        Route::get('/', [CartController::class, 'index'])
            ->name('cart.index');

        // DELETE /api/cart — clear entire cart
        Route::delete('/', [CartController::class, 'clear'])
            ->name('cart.clear');

        // POST /api/cart/items — add item { product_id, quantity }
        Route::post('/items', [CartItemController::class, 'store'])
            ->name('cart-items.store');

        // PATCH /api/cart/items/{cartItem} — update quantity { quantity }
        Route::patch('/items/{cartItem}', [CartItemController::class, 'update'])
            ->name('cart-items.update');

        // DELETE /api/cart/items/{cartItem} — remove item
        Route::delete('/items/{cartItem}', [CartItemController::class, 'destroy'])
            ->name('cart-items.destroy');
    });

    // ═══════════════════════════════════════════════════════════════════
    // CHECKOUT — from checkout-service.ts (✅ Web frontend verified)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('checkout')->group(function () {
        // GET /api/checkout/verify — verify stock before checkout
        // Query: items[]=productId:quantity (repeated)
        Route::get('/verify', [CheckoutController::class, 'verify'])
            ->name('checkout.verify');

        // POST /api/checkout — place order
        // Body: { items: [{ product_id, quantity }], customer: {...}, notes, payment_method }
        Route::post('/', [CheckoutController::class, 'store'])
            ->name('checkout.store');
    });

    // ═══════════════════════════════════════════════════════════════════
    // CUSTOMER ORDERS — Android customer app (🔮 Not in web frontend yet)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('orders')->group(function () {
        // GET /api/orders — customer's order history (paginated)
        // Query: status, page, per_page
        Route::get('/', [CustomerOrderController::class, 'index'])
            ->name('customer.orders.index');

        // GET /api/orders/{order} — single order detail
        // Scoped to authenticated user's orders only
        Route::get('/{order}', [CustomerOrderController::class, 'show'])
            ->name('customer.orders.show');

        // POST /api/orders/{order}/cancel — customer cancels their own order
        // Only allowed for pending/confirmed orders
        Route::post('/{order}/cancel', [CustomerOrderController::class, 'cancel'])
            ->name('customer.orders.cancel');
    });

    // ═══════════════════════════════════════════════════════════════════
    // CUSTOMER REVIEWS — Android customer app (🔮 Not in web frontend yet)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('reviews')->group(function () {
        // POST /api/reviews — submit a review for a product
        // Body: { product_id, rating, comment }
        Route::post('/', [CustomerReviewController::class, 'store'])
            ->name('customer.reviews.store');

        // GET /api/reviews — customer's own reviews
        // Query: page, per_page
        Route::get('/', [CustomerReviewController::class, 'index'])
            ->name('customer.reviews.index');

        // DELETE /api/reviews/{review} — customer deletes their own review
        Route::delete('/{review}', [CustomerReviewController::class, 'destroy'])
            ->name('customer.reviews.destroy');
    });

    // ═══════════════════════════════════════════════════════════════════
    // DELIVERY ADDRESSES — Android customer app (🔮 Not in web frontend yet)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('addresses')->group(function () {
        // GET /api/addresses — list user's delivery addresses
        Route::get('/', [AddressController::class, 'index'])
            ->name('addresses.index');

        // POST /api/addresses — add new address
        // Body: { label, address_line_1, address_line_2, city, area, block, street, building, floor, apartment, directions, is_default }
        Route::post('/', [AddressController::class, 'store'])
            ->name('addresses.store');

        // PUT /api/addresses/{address} — update address
        Route::put('/{address}', [AddressController::class, 'update'])
            ->name('addresses.update');

        // DELETE /api/addresses/{address} — delete address
        Route::delete('/{address}', [AddressController::class, 'destroy'])
            ->name('addresses.destroy');

        // PATCH /api/addresses/{address}/default — set as default address
        Route::patch('/{address}/default', [AddressController::class, 'setDefault'])
            ->name('addresses.set-default');
    });

    // ═══════════════════════════════════════════════════════════════════
    // NOTIFICATIONS — Both admin & customer (🔮 Not in web frontend yet)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('notifications')->group(function () {
        // GET /api/notifications — list user's notifications (paginated)
        // Query: unread_only, type, page, per_page
        Route::get('/', [NotificationController::class, 'index'])
            ->name('notifications.index');

        // PATCH /api/notifications/{notification}/read — mark as read
        Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead'])
            ->name('notifications.read');

        // POST /api/notifications/read-all — mark all as read
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])
            ->name('notifications.read-all');

        // GET /api/notifications/unread-count — get unread count
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])
            ->name('notifications.unread-count');
    });
});
