<?php

namespace App\Observers;

use App\Models\Notification;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

/**
 * ProductObserver — automatically creates "low_stock" notifications.
 *
 * Registered in AppServiceProvider::boot().
 * Fires whenever a Product's "stock" column is updated (e.g. after checkout).
 *
 * FIX: Caches admin IDs so User::where('role','admin') is not re-queried on
 * every stock decrement. The cache is tagged 'admin_ids' and busted whenever
 * a user's role changes (see User model or handle manually on role updates).
 *
 * FIX: Uses Notification::insert() to batch-insert all admin notifications in
 * a single query instead of one INSERT per admin inside a loop.
 */
class ProductObserver
{
    /**
     * The stock threshold below which a "low_stock" notification is sent.
     */
    private const LOW_STOCK_THRESHOLD = 5;

    /**
     * How long to cache the admin ID list (seconds).
     * Invalidate via Cache::forget('admin_ids') after any role change.
     */
    private const ADMIN_IDS_TTL = 3600;

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        if (!$product->isDirty('stock')) {
            return;
        }

        $newStock = (int) $product->stock;
        $oldStock = (int) $product->getOriginal('stock');

        if ($newStock > self::LOW_STOCK_THRESHOLD) {
            return;
        }

        if ($oldStock <= self::LOW_STOCK_THRESHOLD) {
            // Already below threshold before this update — avoid duplicate spam
            return;
        }

        // FIX: Cache admin IDs — avoids a fresh DB query on every stock change
        $adminIds = $this->getAdminIds();

        if ($adminIds->isEmpty()) {
            return;
        }

        $statusText   = $newStock === 0 ? 'Out of stock'    : "Low stock ({$newStock} left)";
        $statusTextAr = $newStock === 0 ? 'نفد المخزون'    : "مخزون منخفض (متبقي {$newStock})";

        $titleEn = "Low Stock Alert: {$product->name_en}";
        $titleAr = "تنبيه مخزون منخفض: {$product->name_ar}";
        $bodyEn  = "{$product->name_en} is now {$statusText}.";
        $bodyAr  = "{$product->name_ar} أصبح {$statusTextAr}.";

        $now  = now()->toDateTimeString();
        $data = json_encode([
            'product_id'   => $product->id,
            'product_name' => $product->name_en,
            'stock'        => $newStock,
            'threshold'    => self::LOW_STOCK_THRESHOLD,
        ]);

        // FIX: Batch-insert all notifications in one query instead of N inserts
        $rows = $adminIds->map(fn($adminId) => [
            'id'       => (string) \Illuminate\Support\Str::uuid(),
            'user_id'  => $adminId,
            'type'     => 'low_stock',
            'title_en' => $titleEn,
            'title_ar' => $titleAr,
            'body_en'  => $bodyEn,
            'body_ar'  => $bodyAr,
            'data'     => $data,
            'is_read'  => false,
            'read_at'  => null,
            'created_at' => $now,
            'updated_at' => $now,
        ])->toArray();

        Notification::insert($rows);
    }

    /**
     * Return cached admin IDs.
     * Call Cache::forget('admin_ids') whenever a user's role changes.
     */
    private function getAdminIds(): \Illuminate\Support\Collection
    {
        return Cache::remember('admin_ids', self::ADMIN_IDS_TTL, function () {
            return User::where('role', 'admin')->pluck('id');
        });
    }
}
