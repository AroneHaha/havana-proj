<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes — Authenticated admin-only operations
|--------------------------------------------------------------------------
|
| All routes require both auth:sanctum AND admin middleware.
| These are exclusively for the web admin dashboard.
|
| Frontend sources:
|   - product-service.ts (admin section)
|   - orders-service.ts
|   - review-service.ts
|
| Route order matters: static paths (e.g., /stats) must come before
| dynamic parameters (e.g., /{product}) to avoid route collision.
|
*/

Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN DASHBOARD — combined summary (1 API call instead of 5+)
    // ═══════════════════════════════════════════════════════════════════

    // GET /api/admin/dashboard/summary — all dashboard data in one request
    // Returns: { orders: { stats, recent }, products: { stats, alerts }, reviews: { stats, recent } }
    Route::get('/dashboard/summary', [AdminDashboardController::class, 'summary'])
        ->name('admin.dashboard.summary');

    // ═══════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN PRODUCTS — from product-service.ts (✅ Web frontend verified)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('products')->group(function () {
        // GET /api/admin/products/stats — product statistics
        // Returns: { total_products, total_value, low_stock_count, out_of_stock_count }
        // MUST be before /{product} to avoid route collision
        Route::get('/stats', [AdminProductController::class, 'stats'])
            ->name('admin.products.stats');

        // GET /api/admin/products — list products with filters (paginated)
        // Query: search, category_id, is_featured, is_best_seller, in_stock, page, per_page
        Route::get('/', [AdminProductController::class, 'index'])
            ->name('admin.products.index');

        // POST /api/admin/products — create product
        // Body: FormData with images[] OR JSON { name, description, price, ... }
        Route::post('/', [AdminProductController::class, 'store'])
            ->name('admin.products.store');

        // GET /api/admin/products/{product} — single product for editing
        Route::get('/{product}', [AdminProductController::class, 'show'])
            ->name('admin.products.show');

        // PATCH /api/admin/products/{product} — update product
        // FormData with _method=PATCH spoofing when files present
        Route::patch('/{product}', [AdminProductController::class, 'update'])
            ->name('admin.products.update');

        // DELETE /api/admin/products/{product} — soft delete product
        Route::delete('/{product}', [AdminProductController::class, 'destroy'])
            ->name('admin.products.destroy');
    });

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN ORDERS — from orders-service.ts (✅ Web frontend verified)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('orders')->group(function () {
        // GET /api/admin/orders/stats — order statistics
        // Returns: { total_revenue, average_order_value, status_counts }
        Route::get('/stats', [AdminOrderController::class, 'stats'])
            ->name('admin.orders.stats');

        // GET /api/admin/orders/sales — sales data with filters (paginated)
        // Query: date_from, date_to, search, product_id, year, month, page, per_page
        // Returns: { data, meta, stats, available_years, product_options }
        Route::get('/sales', [AdminOrderController::class, 'sales'])
            ->name('admin.orders.sales');

        // GET /api/admin/orders — list orders with filters (paginated)
        // Query: status, date_from, date_to, search, page, per_page
        Route::get('/', [AdminOrderController::class, 'index'])
            ->name('admin.orders.index');

        // GET /api/admin/orders/{order} — single order detail
        Route::get('/{order}', [AdminOrderController::class, 'show'])
            ->name('admin.orders.show');

        // PATCH /api/admin/orders/{order}/status — update order status
        // Body: { status } — values: pending, confirmed, preparing, out_for_delivery, delivered, cancelled
        Route::patch('/{order}/status', [AdminOrderController::class, 'updateStatus'])
            ->name('admin.orders.update-status');

        // PATCH /api/admin/orders/{order}/cancel — cancel order (dedicated for audit trail)
        Route::patch('/{order}/cancel', [AdminOrderController::class, 'cancel'])
            ->name('admin.orders.cancel');

        // DELETE /api/admin/orders/{order} — soft delete order
        Route::delete('/{order}', [AdminOrderController::class, 'destroy'])
            ->name('admin.orders.destroy');
    });

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN REVIEWS — from review-service.ts (✅ Web frontend verified)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('reviews')->group(function () {
        // GET /api/admin/reviews/stats — review statistics
        // Returns: { average_rating, total_reviews, rating_distribution }
        Route::get('/stats', [AdminReviewController::class, 'stats'])
            ->name('admin.reviews.stats');

        // GET /api/admin/reviews — list reviews with filters (paginated)
        // Query: search, product_id, rating, visibility, date_from, date_to, page, per_page
        Route::get('/', [AdminReviewController::class, 'index'])
            ->name('admin.reviews.index');

        // GET /api/admin/reviews/{review} — single review detail
        Route::get('/{review}', [AdminReviewController::class, 'show'])
            ->name('admin.reviews.show');

        // PATCH /api/admin/reviews/{review}/status — update review visibility
        // Body: { visibility } — values: visible, hidden, pending
        Route::patch('/{review}/status', [AdminReviewController::class, 'updateStatus'])
            ->name('admin.reviews.update-status');

        // DELETE /api/admin/reviews/{review} — soft delete review
        Route::delete('/{review}', [AdminReviewController::class, 'destroy'])
            ->name('admin.reviews.destroy');
    });

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN CATEGORIES — (🔮 Not in web frontend yet, needed for CRUD)
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('categories')->group(function () {
        // GET /api/admin/categories — list all categories
        // Query: search, page, per_page
        Route::get('/', [AdminCategoryController::class, 'index'])
            ->name('admin.categories.index');

        // POST /api/admin/categories — create category
        // Body: { name_en, name_ar, description_en, description_ar, image, is_active }
        Route::post('/', [AdminCategoryController::class, 'store'])
            ->name('admin.categories.store');

        // GET /api/admin/categories/{category} — single category detail
        Route::get('/{category}', [AdminCategoryController::class, 'show'])
            ->name('admin.categories.show');

        // PATCH /api/admin/categories/{category} — update category
        Route::patch('/{category}', [AdminCategoryController::class, 'update'])
            ->name('admin.categories.update');

        // DELETE /api/admin/categories/{category} — soft delete category
        Route::delete('/{category}', [AdminCategoryController::class, 'destroy'])
            ->name('admin.categories.destroy');
    });

    // ═══════════════════════════════════════════════════════════════════
    // ADMIN NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════

    Route::prefix('notifications')->group(function () {
        // GET /api/admin/notifications/unread-count — unread count for logged-in admin
        // Returns: { data: { unread_count: number } }
        Route::get('/unread-count', [AdminNotificationController::class, 'unreadCount'])
            ->name('admin.notifications.unread-count');

        // POST /api/admin/notifications — send notification to user(s)
        // Body: { user_id, type, title_en, title_ar, message_en, message_ar } OR { user_ids: [...], ... } for bulk
        Route::post('/', [AdminNotificationController::class, 'store'])
            ->name('admin.notifications.store');

        // POST /api/admin/notifications/broadcast — send to all users
        // Body: { type, title_en, title_ar, message_en, message_ar }
        Route::post('/broadcast', [AdminNotificationController::class, 'broadcast'])
            ->name('admin.notifications.broadcast');

        // POST /api/admin/notifications/read-all — mark all as read for logged-in admin
        Route::post('/read-all', [AdminNotificationController::class, 'markAllAsRead'])
            ->name('admin.notifications.read-all');

        // DELETE /api/admin/notifications/delete-read — delete all read notifications
        Route::delete('/delete-read', [AdminNotificationController::class, 'deleteRead'])
            ->name('admin.notifications.delete-read');

        // GET /api/admin/notifications — list sent notifications (paginated)
        // Query: type, is_read, date_from, date_to, page, per_page
        Route::get('/', [AdminNotificationController::class, 'index'])
            ->name('admin.notifications.index');

        // PATCH /api/admin/notifications/{notification}/read — mark single notification as read
        Route::patch('/{notification}/read', [AdminNotificationController::class, 'markAsRead'])
            ->name('admin.notifications.mark-as-read');

        // DELETE /api/admin/notifications/{notification} — delete notification
        Route::delete('/{notification}', [AdminNotificationController::class, 'destroy'])
            ->name('admin.notifications.destroy');
    });
});